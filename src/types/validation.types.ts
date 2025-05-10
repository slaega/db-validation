import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";

export type BaseValidationRule = {
  model: string | symbol | any;
  where: Record<string, any>;
  code?: string;
  message?: string;
  details?: Record<string, any>;
  httpCode?: HttpCodeSafe;
};
export type OptionalParam = Omit<BaseValidationRule, "model" | "where">;

export type EnsureExistsRule = BaseValidationRule & {
  type: "ensureExists" | "exist";
};

export type EnsureNotExistsRule = BaseValidationRule & {
  type: "ensureNotExists" | "unique";
};

export type EnsureCountAtLeastRule = BaseValidationRule & {
  type: "ensureCountAtLeast";
  min: number;
};

export type EnsureCountAtMostRule = BaseValidationRule & {
  type: "ensureCountAtMost";
  max: number;
};

export type EnsureCountEqualsRule = BaseValidationRule & {
  type: "ensureCountEquals";
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
        httpCode?: HttpCodeSafe;
      };
    };

export type ModelName<T = any> = string | (new () => T);

export type WhereType = Record<string, any>;

export const HttpCodeMap = {
  404: NotFoundException,
  400: BadRequestException,
  422: UnprocessableEntityException,
  409: ConflictException,
};
export type HttpCodeSafe = keyof typeof HttpCodeMap;
