import { ValidationBuilderI } from 'src/interfaces/validation.interface';
import { OptionalParam } from 'src/types';
import { EntityTarget, FindOptionsWhere } from 'typeorm';


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

  ensureCountAtLeast<T>(
    model: EntityTarget<T>,
    where: FindOptionsWhere<T>,
    min: number,
    optional?: OptionalParam,
  ): this {
    this.rules.push({
      type: 'ensureCountAtLeast',
      model: model as string,
      where,
      min,
      ...optional,
    });
    return this;
  }

  ensureCountAtMost<T>(
    model: EntityTarget<T>,
    where: FindOptionsWhere<T>,
    max: number,
    optional?: OptionalParam,
  ): this {
    this.rules.push({
      type: 'ensureCountAtMost',
      model: model as string,
      where,
      max,
      ...optional,
    });
    return this;
  }

  ensureCountEquals<T>(
    model: EntityTarget<T>,
    where: FindOptionsWhere<T>,
    equals: number,
    optional?: OptionalParam,
  ): this {
    this.rules.push({
      type: 'ensureCountEquals',
      model: model as string,
      where,
      equals
      ...optional,
    });
    return this;
  }

  unique<T>(
    model: EntityTarget<T>,
    where: FindOptionsWhere<T>,
    optional?: OptionalParam,
  ): this {
    this.rules.push({
      type: 'ensureNotExists',
      model: model as string,
      where,
      ...optional
    });
    return this;
  }


  ensureNotExists<T>(
    model: EntityTarget<T>,
    where: FindOptionsWhere<T>,
    optional?: OptionalParam,
  ): this {
    this.rules.push({
      type: 'ensureNotExists',
      model: model as string,
      where,
      ...optional
    });
    return this;
  }

  ensureExists<T>(
    model: EntityTarget<T>,
    where: FindOptionsWhere<T>,
    optional?: OptionalParam,
  ): this {
    this.rules.push({
      type: 'ensureExists',
      model: model as string,
      where,
      ...optional
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
TypeORMValidationBuilder.create().unique(Date, {})