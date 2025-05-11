import { ValidationStrategy } from "./interfaces";
import {
  EnsureCountAtMostStrategy,
  EnsureCountEqualsStrategy,
  EnsureExistsStrategy,
  EnsureNotExistsStrategy,
  EnsureCountAtLeastStrategy,
} from "./strategies";

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
    this.strategies["ensureCountAtLeast"] = new EnsureCountAtLeastStrategy();
    this.strategies["ensureCountAtMost"] = new EnsureCountAtMostStrategy();
    this.strategies["ensureCountEquals"] = new EnsureCountEqualsStrategy();
    this.strategies["ensureExists"] = new EnsureExistsStrategy();
    this.strategies["ensureNotExists"] = new EnsureNotExistsStrategy();
    this.strategies["exist"] = new EnsureExistsStrategy();
    this.strategies["unique"] = new EnsureNotExistsStrategy();
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
