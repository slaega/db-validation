import { Test } from '@nestjs/testing';
import { DbValidationModule } from './db-validation.module';
import { DbValidationService } from './db-validation.service';
import { PrismaAdapter } from './adapters';
import { ValidationBuilderFactory } from './factories';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient {}
describe('DbValidationService (Prisma)', () => {
  let service: DbValidationService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [
        // on fournit PrismaService via PrismaModule
        {
          module: class PrismaModule {},
          providers: [PrismaService],
          exports: [PrismaService],
        },
        // puis on configure DbValidationModule pour utiliser PrismaService
        DbValidationModule.registerAsync({
          imports: [{ module: class PrismaModule {}, providers: [PrismaService], exports: [PrismaService] }],
          useFactory: (prisma: PrismaService) => new PrismaAdapter(prisma),
          inject: [PrismaService],
        }),
      ],
    }).compile();

    service = mod.get(DbValidationService);
    prisma = mod.get(PrismaService);
    await prisma.$connect();
  });

  afterAll(() => prisma.$disconnect());

  beforeEach(() =>
    prisma.user.create({ data: { email: 'a@a.com', name: 'Alice' } }),
  );
  afterEach(() => prisma.user.deleteMany({}));

  it('exists → NotFoundException', () =>
    expect(
      service.validate(
        ValidationBuilderFactory.build().exists('User', { id: 999 }),
      ),
    ).rejects.toThrowError());

  it('unique → ConflictException', () =>
    expect(
      service.validate(
        ValidationBuilderFactory.build().unique('User', { email: 'a@a.com' }),
      ),
    ).rejects.toThrowError());
});
