// use-db-validation-simple.decorator.ts

import { UseDbValidationFrom } from './use-db-validation-from.decorator';

export function UseDbValidationSimple<T = any>(
    rulesClass: new () => T,
    methodName: keyof T
) {
    return UseDbValidationFrom(rulesClass, methodName, 'dbValidatorService');
}
