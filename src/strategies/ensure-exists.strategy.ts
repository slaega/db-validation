import { ValidationStrategy } from "../interfaces";
import { DbValidationRule, ApplyResult } from "../types";
import { DBAdapter } from "../adapters";
import { getModelName } from "../utils/get-model-name.util";

/**
 * Default values for error codes and HTTP status codes
 */
const DEFAULT_VALUE = {
  CODE: {
    exist: "ERR_NOT_FOUND",
    ensureExist: "ERR_SHOULD_NOT_EXIST",
  },
  HTTP_CODE: {
    exist: 404,
    ensureNotExist: 400,
  },
};

/**
 * Strategy to validate that a record exists in the database
 * Returns the found record if it exists, otherwise returns an error
 */
export class EnsureExistsStrategy implements ValidationStrategy {
  /**
   * Apply the validation strategy
   * @param rule Validation rule containing model and conditions
   * @param adapter Database adapter to use for querying
   * @returns Found record or error if not found
   */
  async apply(
    rule: DbValidationRule,
    adapter: DBAdapter
  ): Promise<ApplyResult> {
    // Try to find the record in the database
    const found = await adapter.findOne(rule.model, rule.where);

    // If record not found, return error with appropriate codes and messages
    if (!found) {
      return {
        error: {
          code: rule.code ?? DEFAULT_VALUE.CODE[rule.type],
          message: rule.message ?? `${getModelName(rule.model)} does not exist`,
          where: rule.where,
          details: rule.details,
          httpCode: rule.httpCode ?? DEFAULT_VALUE.HTTP_CODE[rule.type],
        },
      };
    }

    // Return the found record directly
    return found;
  }
}
