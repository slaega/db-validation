import { FindOptionsWhere } from 'typeorm';
import { ValidationBuilderI } from './validator.interface';

export class TypeORMValidationBuilder implements ValidationBuilderI {
  private rules: any[] = [];
  private validateAll: boolean = false;

  static create(): TypeORMValidationBuilder {
    return new TypeORMValidationBuilder();
  }

  all(): this {
    this.validateAll = true;
    return this;
  }

  exists<T>(
    model: new () => T,
    where: FindOptionsWhere<T>,
    message?: string,
  ): this {
    this.rules.push({
      type: 'exists',
      model,
      where,
      message,
    });
    return this;
  }

  unique<T>(
    model: new () => T,
    where: FindOptionsWhere<T>,
    exclude?: Record<string, any>,
    message?: string,
  ): this {
    this.rules.push({
      type: 'unique',
      model,
      where,
      exclude,
      message,
    });
    return this;
  }

  dependent<T>(
    model: new () => T,
    where: FindOptionsWhere<T>,
    dependentField: keyof T,
    expectedValue: any,
    message?: string,
  ): this {
    this.rules.push({
      type: 'dependent',
      model,
      where,
      dependentField,
      expectedValue,
      message,
    });
    return this;
  }

  getRules() {
    return {
      rules: this.rules,
      validateAll: this.validateAll,
    };
  }
}
