import { ValidationBuilderI } from "./interfaces";
import {
  DbValidationRule,
  ModelType,
  OptionalParam,
  OrmConfig,
  ValidModelType,
  ValidWhereType,
  WhereType,
} from "./types";

export class ValidatorBuilder<T extends keyof OrmConfig>
  implements ValidationBuilderI
{
  private rules: DbValidationRule[] = [];
  private validateAll: boolean = false;

  all(): this {
    this.validateAll = true;
    return this;
  }
  private constructor(private readonly orm: T) {}
  static forPrisma(): ValidatorBuilder<"prisma"> {
    return new ValidatorBuilder("prisma");
  }

  static forTypeorm(): ValidatorBuilder<"typeorm"> {
    return new ValidatorBuilder("typeorm");
  }

  static forMicroOrm(): ValidatorBuilder<"micro-orm"> {
    return new ValidatorBuilder("micro-orm");
  }

  static forSequilize(): ValidatorBuilder<"sequilize"> {
    return new ValidatorBuilder("sequilize");
  }
  static forAny(): ValidatorBuilder<"any"> {
    return new ValidatorBuilder("any");
  }

  ensureCountAtLeast<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    min: number,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "ensureCountAtLeast",
      model: model as string,
      where,
      min,
      ...optional,
    });
    return this;
  }

  ensureCountAtMost<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    max: number,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "ensureCountAtMost",
      model: model as string,
      where,
      max,
      ...optional,
    });
    return this;
  }

  ensureCountEquals<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    equals: number,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "ensureCountEquals",
      model: model as string,
      where,
      equals,
      ...optional,
    });
    return this;
  }

  unique<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "unique",
      model: model as string,
      where,
      ...optional,
    });
    return this;
  }

  ensureNotExists<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "ensureNotExists",
      model: model as string,
      where,
      ...optional,
    });
    return this;
  }

  ensureExists<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "ensureExists",
      model: model as string,
      where,
      ...optional,
    });
    return this;
  }

  exists<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "exist",
      model: model as string,
      where,
      ...optional,
    });
    return this;
  }

  getRules(): { rules: DbValidationRule[]; validateAll: boolean } {
    return {
      rules: this.rules,
      validateAll: this.validateAll,
    };
  }
}
