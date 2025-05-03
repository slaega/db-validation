import { ConflictException } from '@nestjs/common';

import { DBAdapter } from '../adapters/db.adapter';
import { DbValidationRule, UniqueValidationRule } from '../builders/validator.interface';
import { RuleValidator } from '../utils/rule-validator.util';
import { ApplyResult, ValidationStrategy } from './interface.strategy';

/**
 * Strategy for validating uniqueness of records in the database
 * Implements the ValidationStrategy interface
 */
export class UniqueRuleStrategy implements ValidationStrategy {
  /**
   * Applies the unique validation rule
   * @param rule - The validation rule to apply
   * @param databaseService - The database service to use for validation
   * @returns Promise resolving to the validation result
   */
  async apply(
    rule: DbValidationRule,
    dBAdapter: DBAdapter
  ): Promise<ApplyResult> {
    if (!RuleValidator.isValid(rule, "unique") || rule.type !== "unique") {
      return { error: null, data: null };
    }
    const found = await dBAdapter.findFirst(rule.model, rule.where);
    if (found && (!rule.exclude || !this.matchExclude(found, rule.exclude))) {
      return {
        error: new ConflictException({
          errors: [
            {
              code: "ERR-008",
              message: rule.message || `Duplicate resource`,
            },
          ],
        }),
      };
    }
    return { error: null, data: null };
  }

  /**
   * Checks if a found record matches the exclusion criteria
   * @param found - The record found in the database
   * @param exclude - The exclusion criteria to match against
   * @returns True if the record matches the exclusion criteria
   */
  private matchExclude(found: Record<string, unknown>, exclude: Record<string, unknown>): boolean {
    return Object.entries(exclude).every(
      ([key, value]) => found[key] === value
    );
  }
}
