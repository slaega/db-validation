import { DbValidationBuilder } from '../db-validator.builder';

export function UseDbValidation<T = any>(
    rulesClass: new () => T,
    methodName: keyof T | null,
    getValidatorService: (instance: any) => {
        validate: (builder: DbValidationBuilder) => Promise<void>;
    }
) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const validatorServiceInstance = getValidatorService(this);
            if (
                !validatorServiceInstance ||
                !validatorServiceInstance.validate
            ) {
                throw new Error(
                    `ValidatorService or its validator is not available.`
                );
            }

            const rules = new rulesClass();
            const effectiveMethodName = methodName ?? (propertyKey as keyof T);
            const ruleMethod = rules[effectiveMethodName];
            if (typeof ruleMethod !== 'function') {
                throw new Error(
                    `Validation method '${String(effectiveMethodName)}' not found in rules class.`
                );
            }

            await validatorServiceInstance.validate(
                ruleMethod.call(this, ...args)
            );

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
