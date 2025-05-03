import { Inject, Injectable } from '@nestjs/common';

import { DBAdapter } from './adapters';
import { DbValidationRule, ValidationBuilderI } from './builders/validator.interface';
import { DATABASE_ADAPTER } from './config.module-definition';
import { ValidationStrategyFactory } from './factories';
import { ApplyResult } from './strategies/interface.strategy';

/**
 * Service responsible for database validation operations.
 * Handles validation rules and applies appropriate validation strategies.
 */
@Injectable()
export class DbValidationService {
  private readonly strategyFactory: ValidationStrategyFactory;

  /**
   * Creates an instance of DbValidationService.
   * @param dBAdapter - The injected database service implementation
   */
  constructor(
    @Inject(DATABASE_ADAPTER) private dBAdapter: DBAdapter
  ) {
    this.strategyFactory = new ValidationStrategyFactory();
  }

  /**
   * Validates a set of database rules using the provided validation builder.
   * @param dbValidationBuilder - The validation builder containing rules to validate
   * @returns An array of validation results
   * @throws Error if validation fails and validateAll is false, or if validateAll is true and any validation fails
   */
  async validate(
    dbValidationBuilder: ValidationBuilderI
  ): Promise<Pick<ApplyResult, 'data'>[]> {
    const { rules, validateAll } = dbValidationBuilder.getRules();
    const results = [];
    const errors = [];

    for (const rule of rules) {
      const { error, data } = await this.applyRule(rule);
      if (error && !validateAll) throw error;
      if (error && validateAll) errors.push(error);
      results.push(data);
    }
    if (validateAll && errors.length > 0) {
      throw new Error(errors.map((err) => err.message).join("\n"));
    }

    return results;
  }

  /**
   * Applies a single validation rule using the appropriate strategy.
   * @param rule - The validation rule to apply
   * @returns The result of applying the validation rule
   * @throws Error if no strategy is found for the rule type
   */
  private async applyRule(rule: DbValidationRule): Promise<ApplyResult> {
    const strategy = this.strategyFactory.getStrategy(rule.type);
    if (!strategy) {
      throw new Error(`No strategy found for rule type: ${rule.type}`);
    }
    return await strategy.apply(rule, this.dBAdapter);
  }
}
