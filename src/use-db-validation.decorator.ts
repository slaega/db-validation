import { ValidationBuilderI } from "src/interfaces";
import { DbValidationService } from "./db-validation.service";

export type ValidationOptions<T = any> = T & {
  readonly validationResult: T[];
};
export function UseDbValidation<T = any>(
  rulesClass: new () => T,
  methodName: keyof T | null,
  getValidatorService?: (instance: any) => {
    validate: (builder: ValidationBuilderI) => Promise<any[]>;
  }
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      let validationServiceInstance;

      // Si getValidatorService est fourni, l'utiliser
      if (getValidatorService) {
        validationServiceInstance = getValidatorService(this);
      } else {
        // Sinon, rechercher automatiquement dans les propriétés de l'instance
        const entries = Object.entries(this);
        const validationServiceEntry = entries.find(
          ([_, value]) => value instanceof DbValidationService
        );

        if (!validationServiceEntry) {
          throw new Error(
            "DbValidationService not found in instance properties"
          );
        }

        validationServiceInstance =
          validationServiceEntry[1] as DbValidationService;
      }

      if (!validationServiceInstance?.validate) {
        throw new Error(
          `ValidatorService or its validate method is not available.`
        );
      }

      const rules = new rulesClass();
      const effectiveMethodName = methodName ?? (propertyKey as keyof T);
      const ruleMethod = rules[effectiveMethodName];
      if (typeof ruleMethod !== "function") {
        throw new Error(
          `Validation method '${String(effectiveMethodName)}' not found in rules class.`
        );
      }

      const validationResult = await validationServiceInstance.validate(
        ruleMethod.call(this, ...args)
      );

      const paramNames = getParameterNames(originalMethod);
      const optionsIndex = paramNames.indexOf("options");

      const fullArgs = [...args];

      if (optionsIndex >= 0) {
        while (fullArgs.length <= optionsIndex) {
          fullArgs.push(undefined);
        }

        const existingOptions = fullArgs[optionsIndex] || {};
        fullArgs[optionsIndex] = {
          ...existingOptions,
          validationResult,
        };
      } else {
        fullArgs.push({ validationResult });
      }
      return originalMethod.apply(this, fullArgs);
    };

    return descriptor;
  };
}
function getParameterNames(func: Function): string[] {
  const fnStr = func.toString().replace(/[\r\n\s]+/g, " ");

  const result = fnStr
    .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
    .split(",");

  return result.map((param) => param.trim().split("=")[0].trim());
}
