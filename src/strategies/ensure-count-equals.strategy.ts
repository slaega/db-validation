import { DbValidationRule, ApplyResult, EnsureCountEqualsRule } from "../types";
import { DBAdapter } from "../adapters";
import { ValidationStrategy } from "../interfaces";
import { getModelName } from "../utils/get-model-name.util";
import { isValidRule } from "../utils/rule-validator.util";

/**
 * Strategy to validate that a count of records equals an exact value
 * Returns error if count does not match the expected value
 */
export class EnsureCountEqualsStrategy implements ValidationStrategy {
  /**
   * Apply the validation strategy
   * @param rule Validation rule containing model, conditions and expected count
   * @param adapter Database adapter to use for querying
   * @returns Success with count or error if validation fails
   */
  async apply(
    rule: DbValidationRule,
    adapter: DBAdapter
  ): Promise<ApplyResult> {
    // Validate rule type
    if (!isValidRule(rule, "ensureCountEquals")) {
      throw new Error("Invalid rule type for EnsureCountEqualsStrategy");
    }

    // After validation we can safely cast to the specific rule type
    const validRule = rule as EnsureCountEqualsRule;
    const { model, where, equals, code, message, httpCode } = validRule;

    // Get the count of matching records
    const count = await adapter.count(model, where);

    // Check if count matches expected value
    if (count !== equals) {
      return {
        error: {
          code: code || "ERR_COUNT_EQUALS",
          message:
            message ||
            `${getModelName(validRule.model)} must have exactly ${equals} record(s) matching`,
          where,
          details: { count, equals },
          httpCode: httpCode ?? 400,
        },
      };
    }

    return { data: { count } };
  }
}
