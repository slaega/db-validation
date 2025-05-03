import { HttpException } from '@nestjs/common';
import { DBAdapter } from '../adapters';
import { DbValidationRule } from '../builders/validator.interface';

/**
 * Result of applying a validation strategy
 */
export type ApplyResult = {
    /** Error that occurred during validation, if any */
    error: HttpException | null;
    /** Additional data returned from the validation */
    data?: Record<string, unknown> | null;
}
/**
 * Interface for implementing validation strategies
 * Following the Strategy pattern for different validation rules
 */
export interface ValidationStrategy {
    /**
     * Applies the validation strategy to a given rule
     * @param rule - The validation rule to apply
     * @param databaseService - The database service to use for validation
     * @returns A promise that resolves to the validation result
     */
    apply(rule: DbValidationRule, databaseService: DBAdapter): Promise<ApplyResult>;
}
