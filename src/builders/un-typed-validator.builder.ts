import { ValidationBuilderI } from "src/interfaces/validation.interface";
import { DbValidationRule, ModelName, OptionalParam, WhereType } from "src/types";





export class UnTypedDbValidationBuilder implements ValidationBuilderI {
    private rules: DbValidationRule[] = [];
    private validateAll: boolean = false;

    static create(): UnTypedDbValidationBuilder {
        return new UnTypedDbValidationBuilder();
    }

    all(): this {
        this.validateAll = true;
        return this;
    }

    ensureCountAtLeast(
        model: ModelName,
        where: WhereType,
        min: number,
        optional?: OptionalParam,
    ): this {
        this.rules.push({
            type: 'ensureCountAtLeast',
            model: model as string,
            where,
            min,
            ...optional,
        });
        return this;
    }

    ensureCountAtMost(
        model: ModelName,
        where: WhereType,
        max: number,
        optional?: OptionalParam,
    ): this {
        this.rules.push({
            type: 'ensureCountAtMost',
            model: model as string,
            where,
            max,
            ...optional,
        });
        return this;
    }

    ensureCountEquals(
        model: ModelName,
        where: WhereType,
        equals: number,
        optional?: OptionalParam,
    ): this {
        this.rules.push({
            type: 'ensureCountEquals',
            model: model as string,
            where,
            equals
            ...optional,
        });
        return this;
    }

    unique(
        model: ModelName,
        where: WhereType,
        optional?: OptionalParam,
    ): this {
        this.rules.push({
            type: 'ensureNotExists',
            model: model as string,
            where,
            ...optional
        });
        return this;
    }


    ensureNotExists(
        model: ModelName,
        where: WhereType,
        optional?: OptionalParam,
    ): this {
        this.rules.push({
            type: 'ensureNotExists',
            model: model as string,
            where,
            ...optional
        });
        return this;
    }

    ensureExists(
        model: ModelName,
        where: WhereType,
        optional?: OptionalParam,
    ): this {
        this.rules.push({
            type: 'ensureExists',
            model: model as string,
            where,
            ...optional
        });
        return this;
    }
    getRules(): { rules: DbValidationRule[]; validateAll: boolean } {
        return {
            rules: this.rules,
            validateAll: this.validateAll,
        };
    }
}
