import { ValidationStrategy } from "../interfaces";
import { DbValidationRule, ApplyResult } from "../types";
import { DBAdapter } from "../adapters";
import { getModelName } from "../utils/get-model-name.util";
const DEFAULT_VALUE = {
  CODE: {
    unique: "ERR_SHOULD_UNIQUE",
    ensureNotExist: "ERR_SHOULD_EXIST",
  },
  HTTP_CODE: {
    unique: 409,
    ensureNotExist: 400,
  },
  MESSAGE: {
    unique: " must be unique",
    ensureNotExist: "must  exist",
  },
};
export class EnsureNotExistsStrategy implements ValidationStrategy {
  async apply(
    rule: DbValidationRule,
    adapter: DBAdapter
  ): Promise<ApplyResult> {
    const found = await adapter.findOne(rule.model, rule.where);

    if (found) {
      return {
        error: {
          code: rule.code ?? DEFAULT_VALUE.CODE[rule.type],
          message:
            rule.message ??
            `${getModelName(rule.model)} ${DEFAULT_VALUE.MESSAGE[rule.type]}`,
          where: rule.where,
          details: rule.details,
          httpCode: rule.httpCode ?? DEFAULT_VALUE.HTTP_CODE[rule.type],
        },
      };
    }

    return { data: true };
  }
}
