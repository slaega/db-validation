
import { ValidationBuilderI } from "src/interfaces/validation.interface";
import { DbValidationRule, OptionalParam } from "src/types";
import { Prisma } from "src/types/prisma.types";



export class PrismaValidationBuilder implements ValidationBuilderI {
    private rules: DbValidationRule[] = [];
    private validateAll: boolean = false;


    all(): this {
        this.validateAll = true;
        return this;
    }

    static create(): PrismaValidationBuilder {
        return new PrismaValidationBuilder();
    }

    ensureCountAtLeast<M extends Prisma.PrismaModel>(
        model: M,
        where: Prisma.WhereForModel<M>,
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

    ensureCountAtMost<M extends Prisma.PrismaModel>(
        model: M,
        where: Prisma.WhereForModel<M>,
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

    ensureCountEquals<M extends Prisma.PrismaModel>(
        model: M,
        where: Prisma.WhereForModel<M>,
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

    unique<M extends Prisma.PrismaModel>(
        model: M,
        where: Prisma.WhereForModel<M>,
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


    ensureNotExists<M extends Prisma.PrismaModel>(
        model: M,
        where: Prisma.WhereForModel<M>,
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

    ensureExists<M extends Prisma.PrismaModel>(
        model: M,
        where: Prisma.WhereForModel<M>,
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
