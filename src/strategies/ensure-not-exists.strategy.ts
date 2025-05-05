import { ValidationStrategy } from '../interfaces';
import { DbValidationRule, ApplyResult } from '../types';
import { DBAdapter } from '../adapters';

export class EnsureNotExistsStrategy implements ValidationStrategy {
  async apply(
    rule: DbValidationRule,
    adapter: DBAdapter
  ): Promise<ApplyResult> {
    const found = await adapter.findFirst(rule.model, rule.where);

    if (found) {
      return {
        error: {
          code: rule.code ?? 'ERR_SHOULD_NOT_EXIST',
          message: rule.message ?? `${rule.model} must not exist`,
          where: rule.where,
          details: rule.details,
          httpCode: rule.httpCode ?? 409,
        },
      };
    }

    return { data: true };
  }
}