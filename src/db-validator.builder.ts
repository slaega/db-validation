import { ModelWhereMapping } from './types';

// Le type générique pour obtenir le type "where" en fonction du modèle
export type WhereType<M extends keyof ModelWhereMapping> = ModelWhereMapping[M];
export interface ExistsValidationRule<M extends keyof ModelWhereMapping> {
    type: 'exists';
    model: M;
    where: WhereType<M>;
    message?: string;
}

// Une interface de règle pour "unique"
export interface UniqueValidationRule<M extends keyof ModelWhereMapping> {
    type: 'unique';
    model: M;
    where: WhereType<M>;
    exclude?: Record<string, any>;
    message?: string;
}

export interface DependentValidationRule<M extends keyof ModelWhereMapping> {
    type: 'dependent';
    model: M;
    where: WhereType<M>;
    dependentField: string;
    expectedValue: any;
    message?: string;
}
export type DbValidationRule =
    | ExistsValidationRule<keyof ModelWhereMapping>
    | UniqueValidationRule<keyof ModelWhereMapping>
    | DependentValidationRule<keyof ModelWhereMapping>
    | { type: 'equals'; value: any; expected: any; message?: string }
    | { type: 'inList'; value: any; list: any[]; message?: string }
    | { type: 'notInList'; value: any; list: any[]; message?: string }
    | {
          type: 'custom';
          validate: () => Promise<boolean>;
          message?: string;
          errorType?: 'bad_request' | 'conflict' | 'not_found';
      };

// Validation Builder
export class DbValidationBuilder {
    private rules: DbValidationRule[] = [];
    private validateAll: boolean = false;

    static new(): DbValidationBuilder {
        return new DbValidationBuilder();
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
        } as ExistsValidationRule<M>);
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
        } as UniqueValidationRule<M>);
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
        } as DependentValidationRule<M>);
        return this;
    }

    equals(value: any, expected: any, message?: string): this {
        this.rules.push({ type: 'equals', value, expected, message });
        return this;
    }

    inList(value: any, list: any[], message?: string): this {
        this.rules.push({ type: 'inList', value, list, message });
        return this;
    }

    notInList(value: any, list: any[], message?: string): this {
        this.rules.push({ type: 'notInList', value, list, message });
        return this;
    }

    custom(
        validate: () => Promise<boolean>,
        message?: string,
        errorType?: 'bad_request' | 'conflict' | 'not_found'
    ): this {
        this.rules.push({ type: 'custom', validate, message, errorType });
        return this;
    }

    getRules(): { rules: DbValidationRule[]; validateAll: boolean } {
        return {
            rules: this.rules,
            validateAll: this.validateAll,
        };
    }
}
