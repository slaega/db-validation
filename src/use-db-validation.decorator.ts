import { ValidationBuilderI } from "src/interfaces";
import { DbValidationService } from "./db-validation.service";

/**
 * Options passed to the decorated method containing validation results
 * @template T Type of validation results
 */
export type ValidationOptions<T = any> = T & {
  readonly validationResult: T[];
};

/**
 * Decorator that automatically validates database rules before method execution
 * @template T Type of validation rules class
 * @param rulesClass Class containing validation rules
 * @param methodName Name of the method in rules class to execute
 * @param getValidatorService Optional function to retrieve validator service instance
 */
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

      // If getValidatorService is provided, use it
      if (getValidatorService) {
        validationServiceInstance = getValidatorService(this);
      } else {
        // Otherwise, automatically search for DbValidationService in instance properties
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

      // Create instance of validation rules class and get the target method
      const rules = new rulesClass();
      const effectiveMethodName = methodName ?? (propertyKey as keyof T);
      const ruleMethod = rules[effectiveMethodName];
      if (typeof ruleMethod !== "function") {
        throw new Error(
          `Validation method '${String(effectiveMethodName)}' not found in rules class.`
        );
      }

      // Execute validation rules and get results
      const validationResult = await validationServiceInstance.validate(
        ruleMethod.call(this, ...args)
      );

      // Find options parameter index if it exists
      const paramNames = getParameterNames(originalMethod);
      const optionsIndex = paramNames.indexOf("options");

      const fullArgs = [...args];

      // If options parameter exists, merge validation results into it
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
        // Otherwise append validation results as a new parameter
        fullArgs.push({ validationResult });
      }
      return originalMethod.apply(this, fullArgs);
    };

    return descriptor;
  };
}

/**
 * Extract parameter names from a function
 * @param func Function to extract parameter names from
 * @returns Array of parameter names
 */
function getParameterNames(func: Function): string[] {
  const fnStr = func.toString().replace(/[\r\n\s]+/g, " ");

  const result = fnStr
    .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
    .split(",");

  return result.map((param) => param.trim().split("=")[0].trim());
}
