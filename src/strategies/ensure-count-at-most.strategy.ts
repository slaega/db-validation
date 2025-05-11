import { DbValidationRule, ApplyResult, EnsureCountAtMostRule } from "../types";
import { DBAdapter } from "../adapters";
import { isValidRule } from "../utils/rule-validator.util";
import { ValidationStrategy } from "../interfaces";
import { getModelName } from "../utils/get-model-name.util";

/**
 * Strategy to validate that a count of records is at most a maximum value
 * Returns error if count exceeds the maximum
 */
export class EnsureCountAtMostStrategy implements ValidationStrategy {
  /**
   * Apply the validation strategy
   * @param rule Validation rule containing model, conditions and maximum count
   * @param adapter Database adapter to use for querying
   * @returns Success with count or error if validation fails
   */
  async apply(
    rule: DbValidationRule,
    adapter: DBAdapter
  ): Promise<ApplyResult> {
    // Validate rule type
    if (!isValidRule(rule, "ensureCountAtMost")) {
      throw new Error("Invalid rule type for EnsureCountAtMostStrategy");
    }

    // After validation we can safely cast to the specific rule type
    const validRule = rule as EnsureCountAtMostRule;
    const { model, where, max, code, message, httpCode } = validRule;

    // Get the count of matching records
    const count = await adapter.count(model, where);

    // Check if count exceeds maximum
    if (count > max) {
      return {
        error: {
          code: code || "ERR_COUNT_AT_MOST",
          message:
            message ||
            `${getModelName(validRule.model)} must have at most ${max} record(s) matching`,
          where,
          details: { count, max },
          httpCode: httpCode ?? 400,
        },
      };
    }

    return { data: { count } };
  }
}
