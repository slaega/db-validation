import { NotFoundException } from "@nestjs/common";
import { DBAdapter } from "src/adapters";
import { DbValidationRule } from "src/builders";
import { RuleValidator } from "src/utils/rule-validator.util";
import { ApplyResult, ValidationStrategy } from "./interface.strategy";

export class ExistsRuleStrategy implements ValidationStrategy {
    async apply(rule: DbValidationRule, dBAdapter: DBAdapter): Promise<ApplyResult> {
        if (!RuleValidator.isValid(rule, 'exists')) {
            return {
                error:null, data:null
            };
        }
        const found = await dBAdapter.findFirst(
            rule.model,
            rule.where
        );
        if (!found) {
            return { error:new NotFoundException({
                errors: [
                    {
                        code: 'ERR-009',
                        message: rule.message || `Resource not found`,
                    },
                ],
            })};
        }
        
        return {
            error:null,
            data:found,
        };
    }
}