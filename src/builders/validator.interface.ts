/**
 * Represents the mapping between model names and their where clause types
 */
type ModelWhereMapping = Record<string, Record<string, unknown>>;

/**
 * Type for the where clause of a specific model
 * @template M - The model type
 */
export type WhereType<M extends keyof ModelWhereMapping> = ModelWhereMapping[M];

/**
 * Rule for validating if a record exists in the database
 * @template M - The model type
 */
export interface ExistsValidationRule<M extends keyof ModelWhereMapping> {
    type: 'exists';
    model: M;
    where: WhereType<M>;
    message?: string;
}
/**
 * Rule for validating if a record is unique in the database
 * @template M - The model type
 */
export interface UniqueValidationRule<M extends keyof ModelWhereMapping> {
    type: 'unique';
    model: M;
    where: WhereType<M>;
    exclude?: Record<string, any>;
    message?: string;
}

/**
 * Rule for validating if a record's field depends on another field's value
 * @template M - The model type
 */
export interface DependentValidationRule<M extends keyof ModelWhereMapping> {
    type: 'dependent';
    model: M;
    where: WhereType<M>;
    dependentField: string;
    expectedValue: any;
    message?: string;
}
/**
 * Union type of all possible database validation rules
 */
export type DbValidationRule =
    | ExistsValidationRule<keyof ModelWhereMapping>
    | UniqueValidationRule<keyof ModelWhereMapping>
    | DependentValidationRule<keyof ModelWhereMapping>
// | {
//       type: 'custom';
//       validate: () => Promise<boolean>;
//       message?: string;
//       errorType?: 'bad_request' | 'conflict' | 'not_found';
// };

/**
 * Interface for building validation rules
 */
export interface ValidationBuilderI {
    /**
     * Gets the list of validation rules and validation mode
     * @returns Object containing validation rules and validateAll flag
     */
    getRules(): { rules: DbValidationRule[]; validateAll: boolean };
}
