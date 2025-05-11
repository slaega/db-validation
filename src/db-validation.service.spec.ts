import { Test } from '@nestjs/testing';
import { DbValidationService } from './db-validation.service';
import { DBAdapter } from './adapters';
import { ValidationBuilder } from './validation.builder';
import {  NotFoundException, ConflictException } from '@nestjs/common';
import { DATABASE_ADAPTER, ERROR_FORMATTER } from './constant';

describe('DbValidationService whith prisma', () => {
  let service: DbValidationService;
  let mockDBAdapter: jest.Mocked<DBAdapter>;

  beforeEach(async () => {
    // Création du mock de l'adaptateur
    mockDBAdapter = {
      findOne: jest.fn(),
      count: jest.fn(),
    } as jest.Mocked<DBAdapter>;

    // Mock du formateur d'erreur par défaut
    const mockErrorFormatter = (errors: any[]) => errors;

    const module = await Test.createTestingModule({
      providers: [
        DbValidationService,
        {
          provide: DATABASE_ADAPTER,
          useValue: mockDBAdapter,
        },
        {
          provide: ERROR_FORMATTER,
          useValue: mockErrorFormatter,
        },
      ],
    }).compile();

    service = module.get<DbValidationService>(DbValidationService);
  });

  describe('Single record validation', () => {

    it('should throw NotFoundException when record does not exist', async () => {
      // Configuration du mock pour simuler un enregistrement non trouvé
      mockDBAdapter.findOne.mockResolvedValue(null);

      expect(
         service.validate(
          ValidationBuilder.forAny().exists('user', { id: 999 })
        )
      ).rejects.toThrow(NotFoundException);

      expect(mockDBAdapter.findOne).toHaveBeenCalledWith('user', { id: 999 });
    });

    it('should throw ConflictException when unique constraint is violated', async () => {
      // Configuration du mock pour simuler un enregistrement existant
      mockDBAdapter.findOne.mockResolvedValue({ id: 1, email: 'alice@test.com' });
      
      expect(
        service.validate(
          ValidationBuilder.forAny().unique('user', {
            email: 'alice@test.com',
          })
        )
      ).rejects.toThrow(ConflictException);

      expect(mockDBAdapter.findOne).toHaveBeenCalledWith('user', { email: 'alice@test.com' });
    });

     it('should pass when record exists', async () => {
      // Configuration du mock pour simuler un enregistrement trouvé
      mockDBAdapter.findOne.mockResolvedValue({ id: 1, email: 'alice@test.com' });

      await expect(
        service.validate(
          ValidationBuilder.forAny().exists('user', { id: 1 })
        )
      ).resolves.not.toThrow();

      expect(mockDBAdapter.findOne).toHaveBeenCalledWith('user', { id: 1 });
    });

    it('should pass when unique constraint is respected', async () => {
      // Configuration du mock pour simuler aucun enregistrement trouvé
      mockDBAdapter.findOne.mockResolvedValue(null);

      await expect(
        service.validate(
          ValidationBuilder.forAny().unique('user', {
            email: 'newuser@test.com',
          })
        )
      ).resolves.not.toThrow();

      expect(mockDBAdapter.findOne).toHaveBeenCalledWith('user', { email: 'newuser@test.com' });
    });
  });

   describe('Multiple validations (validateAll mode)', () => {

    it('should collect all errors when validateAll is true', async () => {
      // Configuration des mocks pour simuler plusieurs erreurs
      mockDBAdapter.findOne
        .mockResolvedValueOnce(null) // Pour exist
        .mockResolvedValueOnce({ id: 1, email: 'alice@test.com' }); // Pour ensureNotExists

      const validation = ValidationBuilder.forAny()
        .ensureExists('user', { id: 999 })
        .ensureNotExists('user', { email: 'alice@test.com' })
        .all();

      await expect(service.validate(validation))
        .rejects
        .toThrow();

      expect(mockDBAdapter.findOne).toHaveBeenCalledTimes(2);
    });

    it('should stop at first error when validateAll is false', async () => {
      // Configuration du mock pour simuler une erreur
      mockDBAdapter.findOne.mockResolvedValue(null);

      const validation = ValidationBuilder.forAny()
        .exists('user', { id: 999 })
        .ensureNotExists('user', { email: 'alice@test.com' });

      await expect(service.validate(validation))
        .rejects
        .toThrow(NotFoundException);

      // Vérifie que seul le premier appel a été fait
      expect(mockDBAdapter.findOne).toHaveBeenCalledTimes(1);
    });
  });

describe('Count validations', () => {
    it('should validate count correctly', async () => {
      // Configuration du mock pour simuler un comptage
      mockDBAdapter.count.mockResolvedValue(5);

      expect(
        service.validate(
          ValidationBuilder.forAny().ensureCountEquals('user', { role: 'admin' }, 5)
        )
      ).resolves.not.toThrow();

      expect(mockDBAdapter.count).toHaveBeenCalledWith('user', { role: 'admin' });
    });
  });
});
