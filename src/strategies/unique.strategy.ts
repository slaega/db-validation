import { ConflictException, HttpException } from "@nestjs/common";
import { DatabaseService } from "src/adapters";
import { DbValidationRule } from "src/builders";
import { RuleValidator } from "src/utils/rule-validator.util";
import { ValidationStrategy } from "./interface.strategy";

export class UniqueRuleStrategy implements ValidationStrategy {
    async apply(rule: DbValidationRule,  databaseService: DatabaseService): Promise<HttpException | null> {
        if (!RuleValidator.isValid(rule, 'unique') || rule.type !== 'unique') {
            return null;
        }
        const found = await databaseService.findFirst(
            rule.model,
            rule.where
        );
        if (found && (!rule.exclude || !this.matchExclude(found, rule.exclude))) {
            return new ConflictException({
                errors: [
                    {
                        code: 'ERR-008',
                        message: rule.message || `Duplicate resource`,
                    },
                ],
            });
        }
        return null;
    }

    private matchExclude(found: any, exclude: any): boolean {
        return Object.entries(exclude).every(
            ([key, value]) => found[key] === value
        );
    }
}