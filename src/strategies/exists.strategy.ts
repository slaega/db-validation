import { HttpException, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "src/adapters";
import { DbValidationRule } from "src/builders";
import { RuleValidator } from "src/utils/rule-validator.util";
import { ValidationStrategy } from "./interface.strategy";

export class ExistsRuleStrategy implements ValidationStrategy {
    async apply(rule: DbValidationRule, databaseService: DatabaseService): Promise<HttpException | null> {
        if (!RuleValidator.isValid(rule, 'exists')) {
            return null;
        }
        const found = await databaseService.findFirst(
            rule.model,
            rule.where
        );
        if (!found) {
            return new NotFoundException({
                errors: [
                    {
                        code: 'ERR-009',
                        message: rule.message || `Resource not found`,
                    },
                ],
            });
        }
        return null;
    }
}