import {
    HttpException,
    Inject,
    Injectable,
} from '@nestjs/common';


import { MODULE_OPTIONS_TOKEN } from './config.module-definition';
import { DbValidationOptionDto } from './dto/db-validation.dto';
import { ValidationStrategyFactory } from './factories';
import { DbValidationRule, ValidationBuilderI } from './builders/validator.interface';


@Injectable()
export class DbValidationService {
    private readonly strategyFactory: ValidationStrategyFactory;
    constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: DbValidationOptionDto) {
        this.strategyFactory = new ValidationStrategyFactory();
    }

    async validate(dbValidationBuilder: ValidationBuilderI): Promise<void> {     
        const { rules, validateAll } = dbValidationBuilder.getRules();


        for (const rule of rules) {
            const error = await this.applyRule(rule);
            if (error && !validateAll) throw error;
            if (error && validateAll) throw error;
        }
    }

    private async applyRule(rule: DbValidationRule): Promise<HttpException | null> {
        const strategy = this.strategyFactory.getStrategy(rule.type);
        if (!strategy) {
            throw new Error(`No strategy found for rule type: ${rule.type}`);
        }
        return await strategy.apply(rule, this.options.databaseService);
    }
}
