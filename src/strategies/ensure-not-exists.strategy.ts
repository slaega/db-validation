import { ValidationStrategy } from "../interfaces";
import { DbValidationRule, ApplyResult, EnsureNotExistsRule } from "../types";
import { DBAdapter } from "../adapters";
import { getModelName } from "../utils/get-model-name.util";
import { isValidRule } from "../utils/rule-validator.util";

/**
 * Default values for error messages and codes
 */
const DEFAULT_VALUE = {
  CODE: {
    unique: "ERR_SHOULD_UNIQUE",
    ensureNotExist: "ERR_SHOULD_EXIST",
  },
  HTTP_CODE: {
    unique: 409, // Conflict
    ensureNotExist: 400, // Bad Request
  },
  MESSAGE: {
    unique: "must be unique",
    ensureNotExist: "must not exist",
  },
};

/**
 * Strategy to validate that no record exists matching given conditions
 * Returns error if a matching record is found
 */
export class EnsureNotExistsStrategy implements ValidationStrategy {
  /**
   * Apply the validation strategy
   * @param rule Validation rule containing model and conditions
   * @param adapter Database adapter to use for querying
   * @returns Success if no record found, error otherwise
   */
  async apply(
    rule: DbValidationRule,
    adapter: DBAdapter
  ): Promise<ApplyResult> {
    // Validate rule type
    if (!isValidRule(rule, "ensureNotExists") && !isValidRule(rule, "unique")) {
      throw new Error("Invalid rule type for EnsureNotExistsStrategy");
    }

    // After validation we can safely cast to the specific rule type
    const validRule = rule as EnsureNotExistsRule;
    const { model, where, code, message, details, httpCode } = validRule;

    // Try to find a matching record
    const found = await adapter.findOne(model, where);

    // If a record is found, return error
    if (found) {
      return {
        error: {
          code: code ?? DEFAULT_VALUE.CODE[validRule.type],
          message:
            message ??
            `${getModelName(model)} ${DEFAULT_VALUE.MESSAGE[validRule.type]}`,
          where,
          details,
          httpCode: httpCode ?? DEFAULT_VALUE.HTTP_CODE[validRule.type],
        },
      };
    }

    // No record found means validation passed
    return { data: true };
  }
}
