export interface DbValidationOptionDto {
  orm: "prisma" | "typeorm";
  injectToken?: string;
}
