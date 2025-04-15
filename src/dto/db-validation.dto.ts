import { PrismaClient } from '@prisma/client';

export interface DbValidationOptionDto {
  prisma: PrismaClient;
}