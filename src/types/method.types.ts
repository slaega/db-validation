import {
  EntityName as MicroEntityName,
  FilterQuery as MicroFilterQuery,
} from "@mikro-orm/core";
import { FindOptions as SequelizeFindOptions } from "sequelize";
import { Prisma } from "src/types/prisma.types";
import {
  EntityTarget as TypeOrmEntityTarget,
  FindOptionsWhere as TypeOrmFindOptionsWhere,
} from "typeorm";

export type OrmConfig = {
  prisma: {
    model: string | symbol;
    where: any;
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
    model: any;
    where: any;
  };
};
export type ModelType<T extends keyof OrmConfig, M> = T extends "prisma"
  ? M
  : T extends "typeorm"
    ? TypeOrmEntityTarget<T extends "typeorm" ? M : never>
    : T extends "micro-orm"
      ? MicroEntityName<T extends "micro-orm" ? M : never>
      : T extends "sequilize"
        ? new () => T extends "sequilize" ? M : never
        : any;

export type ValidWhereType<T extends keyof OrmConfig, M extends string> = T extends "prisma"
  ? Prisma.WhereForModel<M>
  : T extends "typeorm"
    ? TypeOrmFindOptionsWhere<M>
    : T extends "micro-orm"
      ? MicroFilterQuery<M>
      : T extends "sequilize"
        ? SequelizeFindOptions<M>
        : any;

export type ValidModelType<T extends keyof OrmConfig> = T extends "prisma"
  ? string
  : any;