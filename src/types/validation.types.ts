import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { EntityTarget } from "typeorm";
import { EntityName as MicroEntityName } from "@mikro-orm/core";
import { OrmConfig } from "./method.types";

/**
 * Base type for all validation rules
 * Contains common properties shared across different rule types
 */
export type BaseValidationRule = {
  /** Model identifier based on ORM type */
  model: string | EntityTarget<any> | MicroEntityName<any> | { name: string; type: any } | (new () => any);
  /** Query conditions for the rule */
  where: Record<string, unknown>;
  /** Optional error code */
  code?: string;
  /** Optional error message */
  message?: string;
  /** Optional additional details */
  details?: Record<string, unknown>;
  /** Optional HTTP status code */
  httpCode?: HttpCodeSafe;
};

/** Optional parameters that can be provided with any rule */
export type OptionalParam = Omit<BaseValidationRule, "model" | "where">;

/** Rule to ensure a record exists */
export type EnsureExistsRule = BaseValidationRule & {
  type: "ensureExists" | "exist";
};

/** Rule to ensure a record does not exist (uniqueness check) */
export type EnsureNotExistsRule = BaseValidationRule & {
  type: "ensureNotExists" | "unique";
};

/** Rule to ensure count is at least a minimum value */
export type EnsureCountAtLeastRule = BaseValidationRule & {
  type: "ensureCountAtLeast";
  /** Minimum required count */
  min: number;
};

/** Rule to ensure count is at most a maximum value */
export type EnsureCountAtMostRule = BaseValidationRule & {
  type: "ensureCountAtMost";
  /** Maximum allowed count */
  max: number;
};

/** Rule to ensure count equals an exact value */
export type EnsureCountEqualsRule = BaseValidationRule & {
  type: "ensureCountEquals";
  /** Expected exact count */
  equals: number;
};

/** Union type of all possible validation rules */
export type DbValidationRule =
  | EnsureExistsRule
  | EnsureNotExistsRule
  | EnsureCountAtLeastRule
  | EnsureCountAtMostRule
  | EnsureCountEqualsRule;

/** Result of applying a validation rule */
export type ApplyResult =
  | {
      /** Successful validation data */
      data: unknown;
    }
  | {
      /** Validation error details */
      error: {
        /** Error code */
        code: string;
        /** Error message */
        message: string;
        /** Query conditions that failed */
        where: Record<string, unknown>;
        /** Additional error details */
        details?: Record<string, unknown>;
        /** Affected fields */
        fields?: string[];
        /** HTTP status code */
        httpCode?: HttpCodeSafe;
      };
    };

/** Model identifier type */
export type ModelName<T = unknown> = string | (new () => T);

/** Generic where clause type */
export type WhereType = Record<string, unknown>;

/** Mapping of HTTP status codes to exception types */
export const HttpCodeMap = {
  404: NotFoundException,
  400: BadRequestException,
  422: UnprocessableEntityException,
  409: ConflictException,
} as const;

/** Valid HTTP status codes for validation errors */
export type HttpCodeSafe = keyof typeof HttpCodeMap;
