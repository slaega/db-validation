
import { DbValidationRule, ValidationBuilderI } from "./validator.interface";

type ModelWhereMapping = Record<string, Record<any, any>>;

type WhereType<M extends keyof  ModelWhereMapping> = (ModelWhereMapping)[M];

export class UnTypedDbValidationBuilder implements ValidationBuilderI{
    private rules: DbValidationRule[] = [];
    private validateAll: boolean = false;

    static create(): UnTypedDbValidationBuilder {
        return new UnTypedDbValidationBuilder();
    }

    all(): this {
        this.validateAll = true;
        return this;
    }

    exists<M extends keyof ModelWhereMapping>(
        model: M,
        where: WhereType<M>,
        message?: string
    ): this {
        this.rules.push({
            type: 'exists',
            model,
            where,
            message,
        });
        return this;
    }

    unique<M extends keyof ModelWhereMapping>(
        model: M,
        where: WhereType<M>,
        exclude?: Record<string, any>,
        message?: string
    ): this {
        this.rules.push({
            type: 'unique',
            model,
            where,
            exclude,
            message,
        } );
        return this;
    }

    dependent<M extends keyof ModelWhereMapping>(
        model: M,
        where: WhereType<M>,
        dependentField: string,
        expectedValue: any,
        message?: string
    ): this {
        this.rules.push({
            type: 'dependent',
            model,
            where,
            dependentField,
            expectedValue,
            message,
        });
        return this;
    }
    // custom(
    //     validate: () => Promise<boolean>,
    //     message?: string,
    //     errorType?: 'bad_request' | 'conflict' | 'not_found'
    // ): this {
    //     this.rules.push({ type: 'custom', validate, message, errorType });
    //     return this;
    // }

    getRules(): { rules: DbValidationRule[]; validateAll: boolean } {
        return {
            rules: this.rules,
            validateAll: this.validateAll,
        };
    }
}
