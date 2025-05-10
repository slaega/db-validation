import { DbValidationRule, ApplyResult } from '../types';
import { DBAdapter } from '../adapters';
import { isValidRule } from '../utils/rule-validator.util';
import { ValidationStrategy } from '../interfaces';
import { getModelName } from '../utils/get-model-name.util';

export class EnsureCountAtMostStrategy implements ValidationStrategy {
    async apply(rule: DbValidationRule, adapter: DBAdapter): Promise<ApplyResult> {
        if (rule.type !== 'ensureCountAtMost') {
            throw new Error('Invalid rule type for EnsureCountEqualsStrategy');
        }
        const { model, where, max, code, message, httpCode } = rule;
        const count = await adapter.count(model, where);
        if (count > max) {
            return {
                error: {
                    code: code || 'ERR_COUNT_AT_MOST',
                    message: message || `${getModelName(rule.model)} must have at most ${max} record(s) matching`,
                    where,
                    details: { count, max },
                    httpCode: httpCode ?? 400,
                },
            };
        }
        return { data: { count } };
    }
}