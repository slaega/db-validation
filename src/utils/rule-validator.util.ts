import { DbValidationRule } from "src/builders";

export class RuleValidator {
    static isValid<T extends DbValidationRule>(
        rule: DbValidationRule,
        type: T['type']
    ): rule is T & { model: string } {
        return rule.type === type &&
            typeof rule.where === 'object';
    }
}
export function isValidRule<T extends DbValidationRule>(
    rule: DbValidationRule,
    type: T['type']
): rule is T & { model: string } {
    return rule.type === type &&
        typeof rule.where === 'object';
}
