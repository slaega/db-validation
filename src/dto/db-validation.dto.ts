export interface DbValidationOptionDto {
  orm: "prisma" | "typeorm";
  injectToken?: any;
}
