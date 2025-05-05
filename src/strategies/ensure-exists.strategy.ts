import { ValidationStrategy } from '../interfaces';
import { DbValidationRule, ApplyResult } from '../types';
import { DBAdapter } from '../adapters';
import { NotFoundException } from '@nestjs/common';

export class EnsureExistsStrategy implements ValidationStrategy {
  async apply(
    rule: DbValidationRule,
    adapter: DBAdapter
  ): Promise<ApplyResult> {
    const found = await adapter.findFirst(rule.model, rule.where);

    if (!found) {
      return {
        error: {
          code: rule.code ?? 'ERR_NOT_FOUND',
          message: rule.message ?? `${rule.model} does not exist`,
          where: rule.where,
          details: rule.details,
          httpCode: rule.httpCode ?? 404,
        },
      };
    }

    return { data: found };
  }
}