import { DbValidationRule } from "../types";

/**
 * Utility class for validating database validation rules
 */
export class RuleValidator {
  /**
   * Validates if a rule matches the expected type and has valid structure
   * @param rule Rule to validate
   * @param type Expected rule type
   * @returns Type guard asserting the rule is of the expected type
   */
  static isValid<T extends DbValidationRule>(
    rule: DbValidationRule,
    type: T["type"]
  ): rule is T & { model: string } {
    return rule.type === type && typeof rule.where === "object";
  }
}

/**
 * Utility function to check if a rule matches the expected type
 * @param rule Rule to validate
 * @param type Expected rule type
 * @returns True if the rule matches the type
 */
export function isValidRule<T extends DbValidationRule>(
  rule: DbValidationRule,
  type: T["type"]
): boolean {
  return rule.type as T["type"] === type;
}
