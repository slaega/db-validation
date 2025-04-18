import  { ModelWhereMapping}  from "../types/prisma-type";
import { DbValidationRule, ValidationBuilderI } from "./validator.interface";




type WhereType<M extends keyof  ModelWhereMapping> = (ModelWhereMapping)[M];

export class PrismaValidationBuilder implements ValidationBuilderI{
    private rules: DbValidationRule[] = [];
    private validateAll: boolean = false;


    all(): this {
        this.validateAll = true;
        return this;
    }

    static create(): PrismaValidationBuilder {
        return new PrismaValidationBuilder();
    }

    exists<M extends keyof  ModelWhereMapping>(
        model: M,
        where: WhereType<M>,
        message?: string
    ): this {
        this.rules.push({
            type: 'exists',
            model: model as string,
            where,
            message,
        });
        return this;
    }

    unique<M extends keyof  ModelWhereMapping>(
        model: M,
        where: WhereType<M>,
        message?: string
    ): this {
        this.rules.push({
            type: 'unique',
            model: model as string,
            where,
            message,
        });
        return this;
    }

    dependent<M extends keyof  ModelWhereMapping>(
        model: M,
        where: WhereType<M>,
        dependentField: string,
        expectedValue: any,
        message?: string
    ): this {
        this.rules.push({
            type: 'dependent',
            model: model as string,
            where,
            message,
            dependentField,
            expectedValue,
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
