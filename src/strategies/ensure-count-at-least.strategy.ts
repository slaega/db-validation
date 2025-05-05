import { DbValidationRule, ApplyResult } from '../types';
import { DBAdapter } from '../adapters';
import { isValidRule } from 'src/utils/rule-validator.util';
import { ValidationStrategy } from 'src/interfaces';


export class EnsureCountAtLeastStrategy implements ValidationStrategy  {

    async apply(rule: DbValidationRule, adapter: DBAdapter): Promise<ApplyResult> {
        if (isValidRule(rule, 'ensureCountAtLeast')) {
            throw new Error('Invalid rule type for EnsureCountEqualsStrategy');
        }
        const { model, where, min, code, message,httpCode } = rule;
        const count = await adapter.count(model, where);
        if (count < min) {
            return {
                error: {
                    code: code || 'ERR_COUNT_AT_LEAST',
                    message: message || `${model} must have at least ${min} record(s) matching`,
                    where,
                    details: { count, min },
                    httpCode: httpCode ?? 404,
                },
            };
        }
        return { data: { count } };
    }
}