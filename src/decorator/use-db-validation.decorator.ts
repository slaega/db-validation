import { ValidationBuilderI } from "src/interfaces";
import { ApplyResult } from "src/types";

export type ValidationOptions<T = any> = T & {
  readonly validationResult:T[];
};
export function UseDbValidation<T = any>(
  rulesClass: new () => T,
  methodName: keyof T | null,
  getValidatorService: (instance: any) => {
    validate: (
      builder: ValidationBuilderI
    ) => Promise<any[]>;
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
      if (!validatorServiceInstance || !validatorServiceInstance.validate) {
        throw new Error(`ValidatorService or its validator is not available.`);
      }

      const rules = new rulesClass();
      const effectiveMethodName = methodName ?? (propertyKey as keyof T);
      const ruleMethod = rules[effectiveMethodName];
      if (typeof ruleMethod !== "function") {
        throw new Error(
          `Validation method '${String(effectiveMethodName)}' not found in rules class.`
        );
      }

      const validationResult = await validatorServiceInstance.validate(
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
