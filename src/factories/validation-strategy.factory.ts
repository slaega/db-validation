import { DependentRuleStrategy, ExistsRuleStrategy, UniqueRuleStrategy } from "src/strategies";
import { ValidationStrategy } from "src/strategies/interface.strategy";

export class ValidationStrategyFactory {
    private strategies: Record<string, ValidationStrategy> = {};

    constructor() {
        this.strategies['exists'] = new ExistsRuleStrategy();
        this.strategies['unique'] = new UniqueRuleStrategy();
        this.strategies['dependent'] = new DependentRuleStrategy();
    }

    getStrategy(ruleType: string): ValidationStrategy | null {
        return this.strategies[ruleType] || null;
    }
}
