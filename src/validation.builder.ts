import { ValidationBuilderI } from './interfaces';
import {
  DbValidationRule,
  ModelType,
  OptionalParam,
  OrmConfig,
  ValidModelType,
  ValidWhereType,
  WhereType,
} from './types';
import { convertModelType } from './utils/model-type.util';

/**
 * Builder class for creating database validation rules
 * Supports multiple ORMs through a unified interface
 * @template T Type of ORM being used
 */
export class ValidationBuilder<T extends keyof OrmConfig>
  implements ValidationBuilderI
{
  /** List of validation rules to apply */
  private rules: DbValidationRule[] = [];

  /** Whether to validate all rules or stop at first error */
  private validateAll: boolean = false;

  /**
   * Set validateAll flag to true to check all rules
   * even if one fails
   */
  all(): this {
    this.validateAll = true;
    return this;
  }

  /** Private constructor to enforce factory methods */
  private constructor(private readonly orm: T) {}

  /** Create a builder for Prisma ORM */
  static forPrisma(): ValidationBuilder<"prisma"> {
    return new ValidationBuilder("prisma");
  }

  /** Create a builder for TypeORM */
  static forTypeorm(): ValidationBuilder<"typeorm"> {
    return new ValidationBuilder("typeorm");
  }

  /** Create a builder for MikroORM */
  static forMicroOrm(): ValidationBuilder<"micro-orm"> {
    return new ValidationBuilder("micro-orm");
  }

  /** Create a builder for Sequelize */
  static forSequilize(): ValidationBuilder<"sequilize"> {
    return new ValidationBuilder("sequilize");
  }

  /** Create a builder for any ORM type */
  static forAny(): ValidationBuilder<"any"> {
    return new ValidationBuilder("any");
  }

  /**
   * Ensure that the count of records matching the condition is at least the specified minimum
   * @template M Model type for validation
   * @param model Model to validate against
   * @param where Conditions to match
   * @param min Minimum number of records required
   * @param optional Optional parameters (error message, code, etc.)
   */
  ensureCountAtLeast<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    min: number,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "ensureCountAtLeast",
      model: convertModelType(model, this.orm),
      where,
      min,
      ...optional,
    });
    return this;
  }

  /**
   * Ensure that the count of records matching the condition is at most the specified maximum
   * @template M Model type for validation
   * @param model Model to validate against
   * @param where Conditions to match
   * @param max Maximum number of records allowed
   * @param optional Optional parameters (error message, code, etc.)
   */
  ensureCountAtMost<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    max: number,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "ensureCountAtMost",
      model: convertModelType(model, this.orm),
      where,
      max,
      ...optional,
    });
    return this;
  }

  /**
   * Ensure that the count of records matching the condition equals the specified number
   * @template M Model type for validation
   * @param model Model to validate against
   * @param where Conditions to match
   * @param equals Exact number of records required
   * @param optional Optional parameters (error message, code, etc.)
   */
  ensureCountEquals<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    equals: number,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "ensureCountEquals",
      model: convertModelType(model, this.orm),
      where,
      equals,
      ...optional,
    });
    return this;
  }

  /**
   * Validate that no record exists matching the given conditions (409 Conflict)
   * @template M Model type for validation
   * @param model Model to validate against
   * @param where Conditions that should not match any record
   * @param optional Optional parameters (error message, code, etc.)
   */
  unique<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "unique",
      model: convertModelType(model, this.orm),
      where,
      ...optional,
    });
    return this;
  }

  /**
   * Ensure that no record exists matching the given conditions (400 Bad Request)
   * @template M Model type for validation
   * @param model Model to validate against
   * @param where Conditions that should not match any record
   * @param optional Optional parameters (error message, code, etc.)
   */
  ensureNotExists<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "ensureNotExists",
      model: convertModelType(model, this.orm),
      where,
      ...optional,
    });
    return this;
  }

  /**
   * Ensure that a record exists matching the given conditions (400 Bad Request)
   * Returns the found record if successful
   * @template M Model type for validation
   * @param model Model to validate against
   * @param where Conditions that must match a record
   * @param optional Optional parameters (error message, code, etc.)
   */
  ensureExists<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "ensureExists",
      model: convertModelType(model, this.orm),
      where,
      ...optional,
    });
    return this;
  }

  /**
   * Check if a record exists matching the given conditions (404 Not Found)
   * Returns the found record if successful
   * @template M Model type for validation
   * @param model Model to validate against
   * @param where Conditions that must match a record
   * @param optional Optional parameters (error message, code, etc.)
   */
  exists<M extends ValidModelType<T>>(
    model: ModelType<T, M>,
    where: ValidWhereType<T, M>,
    optional?: OptionalParam
  ): this {
    this.rules.push({
      type: "exist",
      model: convertModelType(model, this.orm),
      where,
      ...optional,
    });
    return this;
  }

  /**
   * Get the current validation rules and validateAll flag
   * @returns Object containing rules array and validateAll boolean
   */
  getRules(): { rules: DbValidationRule[]; validateAll: boolean } {
    return {
      rules: this.rules,
      validateAll: this.validateAll,
    };
  }
}
