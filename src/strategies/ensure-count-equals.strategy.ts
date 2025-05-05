import { DbValidationRule, ApplyResult } from '../types';
import { DBAdapter } from '../adapters';
import { isValidRule } from 'src/utils/rule-validator.util';
import { ValidationStrategy } from 'src/interfaces';

export class EnsureCountEqualsStrategy implements ValidationStrategy {
    async apply(rule: DbValidationRule, adapter: DBAdapter): Promise<ApplyResult> {
        if (isValidRule(rule,'ensureCountEquals')) {
            throw new Error('Invalid rule type for EnsureCountEqualsStrategy');
        }
        const { model, where, equals, code, message,httpCode } = rule;
        const count = await adapter.count(model, where);
        if (count !== equals) {
            return {
                error: {
                    code: code || 'ERR_COUNT_EQUALS',
                    message: message || `${model} must have exactly ${equals} record(s) matching`,
                    where,
                    details: { count, equals },
                    httpCode: httpCode ?? 400,
                },
            };
        }
        return { data: { count } };
    }
}