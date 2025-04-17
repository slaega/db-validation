import { UseDbValidationFrom } from './use-db-validation-from.decorator';

export function UseDbValidationSimple<T = any>(
    rulesClass: new () => T,
    methodName: keyof T | null
) {
    return UseDbValidationFrom(rulesClass, methodName, 'dbValidatorService');
}
