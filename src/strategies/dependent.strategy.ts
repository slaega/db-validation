import { BadRequestException, HttpException } from "@nestjs/common";
import { DatabaseService } from "src/adapters";

import { isValidRule } from "src/utils/rule-validator.util";
import { ValidationStrategy } from "./interface.strategy";
import { DbValidationRule } from "src/builders";

export class DependentRuleStrategy implements ValidationStrategy {
    async apply(rule: DbValidationRule, databaseService: DatabaseService): Promise<HttpException | null> {
        if (!isValidRule(rule, 'dependent') || rule.type !== 'dependent') {
            return null;
        }
        const found = await databaseService.findFirst(rule.model, {
            ...rule.where as object,
            [rule.dependentField]: rule.expectedValue,
        });
        if (!found) {
            return new BadRequestException({
                errors: [
                    {
                        code: 'ERR-007',
                        message: rule.message || `Invalid dependent relationship`,
                    },
                ],
            });
        }
        return null;
    }
}