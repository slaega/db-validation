import { HttpException } from "@nestjs/common";
import { DatabaseService } from "src/adapters";
import { DbValidationRule } from "src/builders/db-validator.builder";

export interface ValidationStrategy {
    apply(rule: DbValidationRule, databaseService: DatabaseService): Promise<HttpException | null>;
}
