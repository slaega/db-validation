import { DbValidationRule } from "src/types";

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