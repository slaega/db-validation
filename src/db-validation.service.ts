import { HttpException, Inject, Injectable } from '@nestjs/common';
import { DBAdapter } from './adapters';
import { DATABASE_ADAPTER, ERROR_FORMATTER } from './constant';
import { ValidationStrategyFactory } from './factories';
import { ValidationBuilderI } from './interfaces';
import { ApplyResult, DbValidationRule, HttpCodeMap } from './types';

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

  async validate(dbValidationBuilder: ValidationBuilderI): Promise<any> {
    const { rules, validateAll } = dbValidationBuilder.getRules();
    const results = [];
    const errors = [];
  
    for (const rule of rules) {
      const result = await this.applyRule(rule);
  
      if ('error' in result && result.error && !validateAll) {
        const httpCode = result.error.httpCode ?? 400;
       
        throw new HttpCodeMap[httpCode](
          this.formatError([result.error]),
         );
      }
  
      if ('error' in result && result.error && validateAll) {
        errors.push(result.error);
      }
      if ('data' in result) {
        results.push(result.data);
      }
    }
  
    if (validateAll && errors.length > 0) {
      throw new HttpException(this.formatError(errors), 400);
    }
  
    return results;
  }

  private async applyRule(rule: DbValidationRule): Promise<ApplyResult> {
    const strategy = this.strategyFactory.getStrategy(rule.type);
    if (!strategy) {
      throw new Error(`No strategy found for rule type: ${rule.type}`);
    }
    return await strategy.apply(rule, this.dBAdapter);
  }

  private formatError(errors: Array<{
    code: string;
    message: string;
    where: Record<string, any>;
    details?: any;
  }>): any {
    return this.errorFormatter(errors);
  }
}
