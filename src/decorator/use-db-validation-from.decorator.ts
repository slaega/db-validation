import { UseDbValidation } from './use-db-validation.decorator';

export function UseDbValidationFrom<T = any>(
    rulesClass: new () => T,
    methodName: keyof T | null,
    serviceKey: string = 'validationService'
) {
    return UseDbValidation(rulesClass, methodName, (self: any) => {
        const service = self?.[serviceKey];
        if (!service) {
            throw new Error(`Service '${serviceKey}' not found on class.`);
        }
        return service;
    });
}
