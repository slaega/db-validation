import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DbValidationModule } from './db-validation.module';
import { DbValidationService } from './db-validation.service';
import { DbValidationBuilder } from './db-validator.builder';

describe('DbValidationService', () => {
  let service: DbValidationService;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    const moduleRef = await Test.createTestingModule({
      imports: [
        DbValidationModule.forRoot({ prisma }),
      ],
    }).compile();

    service = moduleRef.get(DbValidationService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
  beforeEach(async () => {
    await prisma.user.create({
      data: {
        email: "slaega@gmail.com",
        name: "Slaega User",
      },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error when model does not exist', async () => {
    await expect(
      service.validate(
        new DbValidationBuilder()
          .exists('User', { id: 1 })
      )
    ).rejects.toThrowError(NotFoundException);
  });

  it('should throw an error when model already exists', async () => {
    await expect(
      service.validate(
        new DbValidationBuilder()
          .unique('User', { email: "slaega@gmail.com" })
      )
    ).rejects.toThrowError(ConflictException);
  });
});
