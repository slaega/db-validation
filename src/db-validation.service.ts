import { HttpException, Inject, Injectable } from '@nestjs/common';
import { DBAdapter } from './adapters';
import { DATABASE_ADAPTER, ERROR_FORMATTER } from './constant';
import { ValidationBuilderI } from './interfaces';
import { ApplyResult, DbValidationRule, HttpCodeMap } from './types';
import { ValidationStrategyFactory } from './validation-strategy.factory';

/**
 * Service for handling database validation rules
 * Uses strategy pattern to apply different validation rules
 */
@Injectable()
export class DbValidationService {
  private readonly strategyFactory: ValidationStrategyFactory;

  constructor(
    @Inject(DATABASE_ADAPTER) private dBAdapter: DBAdapter,
    @Inject(ERROR_FORMATTER)
    private readonly errorFormatter: (
      errors: Array<{
        code: string;
        message: string;
        where: Record<string, any>;
        details?: any;
      }>
    ) => any
  ) {
    this.strategyFactory = new ValidationStrategyFactory();
  }

  /**
   * Validate database rules using the provided builder
   * @param dbValidationBuilder Builder containing validation rules
   * @returns Array of validation results
   * @throws HttpException if validation fails
   */
  async validate(dbValidationBuilder: ValidationBuilderI): Promise<any> {
    const { rules, validateAll } = dbValidationBuilder.getRules();
    const results = [];
    const errors = [];
  
    for (const rule of rules) {
      const result = await this.applyRule(rule);
  
      // If error and not validating all, throw immediately
      if ('error' in result && result.error && !validateAll) {
        const httpCode = result.error.httpCode ?? 400;
        throw new HttpCodeMap[httpCode](
          this.formatError([result.error])
        );
      }
  
      // Collect errors if validating all rules
      if ('error' in result && result.error && validateAll) {
        errors.push(result.error);
      }
      if ('data' in result) {
        results.push(result.data);
      }
    }
  
    // If validating all and there are errors, throw combined error
    if (validateAll && errors.length > 0) {
      throw new HttpException(this.formatError(errors), 400);
    }
  
    return results;
  }

  /**
   * Apply a single validation rule using the appropriate strategy
   * @param rule Validation rule to apply
   * @returns Result of rule application
   * @throws Error if no strategy found for rule type
   */
  private async applyRule(rule: DbValidationRule): Promise<ApplyResult> {
    const strategy = this.strategyFactory.getStrategy(rule.type);
    if (!strategy) {
      throw new Error(`No strategy found for rule type: ${rule.type}`);
    }
    return await strategy.apply(rule, this.dBAdapter);
  }

  /**
   * Format validation errors using the configured formatter
   * @param errors Array of validation errors
   * @returns Formatted error object
   */
  private formatError(errors: Array<{
    code: string;
    message: string;
    where: Record<string, any>;
    details?: any;
  }>): any {
    return this.errorFormatter(errors);
  }
}
