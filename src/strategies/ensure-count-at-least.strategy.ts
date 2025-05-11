import { DbValidationRule, ApplyResult, EnsureCountAtLeastRule } from "../types";
import { DBAdapter } from "../adapters";
import { isValidRule } from "../utils/rule-validator.util";
import { ValidationStrategy } from "../interfaces";
import { getModelName } from "../utils/get-model-name.util";

/**
 * Strategy to validate that a count of records is at least a minimum value
 */
export class EnsureCountAtLeastStrategy implements ValidationStrategy {
  /**
   * Apply the validation strategy
   * @param rule Validation rule containing model, conditions and minimum count
   * @param adapter Database adapter to use for querying
   * @returns Success or error with appropriate message
   */
  async apply(
    rule: DbValidationRule,
    adapter: DBAdapter
  ): Promise<ApplyResult> {
    if (!isValidRule(rule, "ensureCountAtLeast")) {
      throw new Error("Invalid rule type for EnsureCountAtLeastStrategy");
    }

    // After validation we can safely cast to the specific rule type
    const validRule = rule as EnsureCountAtLeastRule;
    const { model, where, min, code, message, httpCode } = validRule;

    // Get the count of matching records
    const count = await adapter.count(model, where);

    // Check if count meets minimum requirement
    if (count < min) {
      return {
        error: {
          code: code || "ERR_COUNT_AT_LEAST",
          message:
            message || `${getModelName(validRule.model)} must have at least ${min} record(s) matching`,
          where,
          details: { count, min },
          httpCode: httpCode ?? 400,
        },
      };
    }
    return { data: { count } };
  }
}
