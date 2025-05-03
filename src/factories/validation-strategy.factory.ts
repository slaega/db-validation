import { DependentRuleStrategy, ExistsRuleStrategy, UniqueRuleStrategy } from '../strategies';
import { ValidationStrategy } from '../strategies/interface.strategy';

/**
 * Factory class for creating and managing validation strategies.
 * Implements the Factory pattern to provide different validation strategies
 * based on the rule type.
 */
export class ValidationStrategyFactory {
    /** Map of strategy types to their implementations */
    private readonly strategies: Record<string, ValidationStrategy> = {};

    /**
     * Initializes the factory with all available validation strategies
     */
    constructor() {
        this.strategies['exists'] = new ExistsRuleStrategy();
        this.strategies['unique'] = new UniqueRuleStrategy();
        this.strategies['dependent'] = new DependentRuleStrategy();
    }

    /**
     * Retrieves a validation strategy based on the rule type
     * @param ruleType - The type of validation rule
     * @returns The corresponding validation strategy or null if not found
     */
    getStrategy(ruleType: string): ValidationStrategy | null {
        return this.strategies[ruleType] || null;
    }
}
