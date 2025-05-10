import { DbValidationRule } from "src/types";

export class RuleValidator {
  static isValid<T extends DbValidationRule>(
    rule: DbValidationRule,
    type: T["type"]
  ): rule is T & { model: string } {
    return rule.type === type && typeof rule.where === "object";
  }
}
export function isValidRule<T extends DbValidationRule>(
  rule: DbValidationRule,
  type: T["type"]
) {
  return rule.type as T["type"] === type ;
}
