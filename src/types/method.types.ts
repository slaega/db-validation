import {
  EntityName as MicroEntityName,
  FilterQuery as MicroFilterQuery,
} from "@mikro-orm/core";
import { FindOptions as SequelizeFindOptions } from "sequelize";
import { Prisma } from "../types/prisma.types";
import {
  EntityTarget as TypeOrmEntityTarget,
  FindOptionsWhere as TypeOrmFindOptionsWhere,
} from "typeorm";

/**
 * Configuration type for different ORM adapters
 * Defines model and where types for each supported ORM
 */
export type OrmConfig = {
  prisma: {
    model: string;
    where: Prisma.WhereForModel<string>;
  };
  typeorm: {
    model: TypeOrmEntityTarget<any>;
    where: TypeOrmFindOptionsWhere<any>;
  };
  "micro-orm": {
    model: MicroEntityName<any>;
    where: MicroFilterQuery<any>;
  };
  sequilize: {
    model: new () => any;
    where: SequelizeFindOptions<any>;
  };
  any: {
    model: string | TypeOrmEntityTarget<any> | (new () => any);
    where: Record<string, unknown>;
  };
};

/**
 * Get model type for a specific ORM
 * @template T ORM type
 * @template M Model type
 */
export type ModelType<T extends keyof OrmConfig, M> = T extends "prisma"
  ? string
  : T extends "typeorm"
    ? TypeOrmEntityTarget<any>
    : T extends "micro-orm"
      ? MicroEntityName<any>
      : T extends "sequilize"
        ? new () => any
        : string | TypeOrmEntityTarget<any> | (new () => any);

/**
 * Get where clause type for a specific ORM and model
 * @template T ORM type
 * @template M Model type
 */
export type ValidWhereType<T extends keyof OrmConfig, M> = T extends "prisma"
  ? M extends string ? Prisma.WhereForModel<M & Prisma.PrismaModel> : never
  : T extends "typeorm"
    ? TypeOrmFindOptionsWhere<any>
    : T extends "micro-orm"
      ? MicroFilterQuery<any>
      : T extends "sequilize"
        ? SequelizeFindOptions<any>
        : Record<string, unknown>;

/**
 * Get valid model type for a specific ORM
 * @template T ORM type
 */
export type ValidModelType<T extends keyof OrmConfig> = T extends "prisma"
  ? string
  : T extends "typeorm"
    ? TypeOrmEntityTarget<any>
    : T extends "micro-orm"
      ? MicroEntityName<any>
      : T extends "sequilize"
        ? new () => any
        : string | TypeOrmEntityTarget<any> | (new () => any);