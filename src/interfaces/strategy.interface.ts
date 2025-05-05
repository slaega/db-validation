import { DBAdapter } from '../adapters';
import { ApplyResult, DbValidationRule } from 'src/types';



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
    apply(rule: DbValidationRule, adapter: DBAdapter): Promise<ApplyResult>
}
