export type BaseValidationRule = {
    model: string;
    where: Record<string, any>;
    code?: string;
    message?: string;
    details?: Record<string, any>;
    httpCode?: number;
};
export type OptionalParam = Exclude<BaseValidationRule, 'model' | 'where'>

export type EnsureExistsRule = BaseValidationRule & {
    type: 'ensureExists';
};

export type EnsureNotExistsRule = BaseValidationRule & {
    type: 'ensureNotExists';
};

export type EnsureCountAtLeastRule = BaseValidationRule & {
    type: 'ensureCountAtLeast';
    min: number;
};

export type EnsureCountAtMostRule = BaseValidationRule & {
    type: 'ensureCountAtMost';
    max: number;
};

export type EnsureCountEqualsRule = BaseValidationRule & {
    type: 'ensureCountEquals';
    equals: number;
};

export type DbValidationRule =
    | EnsureExistsRule
    | EnsureNotExistsRule
    | EnsureCountAtLeastRule
    | EnsureCountAtMostRule
    | EnsureCountEqualsRule;

export type ApplyResult =
    | {
        data: any;
    }
    | {
        error: {
            code: string;
            message: string;
            where: Record<string, any>;
            details?: Record<string, any>;
            fields?: string[];
            httpCode?: number;
        };
    };


    export type ModelName<T = any> = string | (new () => T);

export type WhereType = Record<string, any>