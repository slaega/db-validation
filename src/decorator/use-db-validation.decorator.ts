import { DbValidationBuilder } from '../db-validator.builder';

// use-db-validation.decorator.ts (inchangé)
export function UseDbValidation<T = any>(
    rulesClass: new () => T,
    methodName: keyof T,
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
            const ruleMethod = rules[methodName];
            if (typeof ruleMethod !== 'function') {
                throw new Error(
                    `Validation method '${String(methodName)}' not found in rules class.`
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
