import { ValidationStrategy } from "../interfaces";
import { DbValidationRule, ApplyResult } from "../types";
import { DBAdapter } from "../adapters";
import { getModelName } from "../utils/get-model-name.util";
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
export class EnsureExistsStrategy implements ValidationStrategy {
  async apply(
    rule: DbValidationRule,
    adapter: DBAdapter
  ): Promise<ApplyResult> {
    const found = await adapter.findOne(rule.model, rule.where);

    if (!found) {
      return {
        error: {
          code:
          rule.code ?? DEFAULT_VALUE.CODE[rule.type],
          message: rule.message ?? `${getModelName(rule.model)} does not exist`,
          where: rule.where,
          details: rule.details,
          httpCode: rule.httpCode ?? DEFAULT_VALUE.HTTP_CODE[rule.type],
        },
      };
    }

    return found;
  }
}
