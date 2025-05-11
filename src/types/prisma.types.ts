import { PrismaClient } from "@prisma/client";

/**
 * Prisma-specific type utilities for model and query handling
 */
export namespace Prisma {
  /**
   * Filters out Prisma's internal properties that start with '$'
   * @template T - Type to filter
   */
  export type FilterOutDollar<T> = T extends `$${string}` ? never : T;

  /**
   * Valid Prisma model names, excluding internal properties
   */
  export type PrismaModel = FilterOutDollar<keyof PrismaClient> | string;

  /**
   * Gets the delegate type for a Prisma model
   * @template M - Model name
   */
  export type PrismaDelegate<M extends PrismaModel> = M extends keyof PrismaClient
    ? PrismaClient[M]
    : never;

  /**
   * Extracts the where clause type for a specific model
   * @template M - Model name
   */
  export type WhereForModel<M extends PrismaModel> = PrismaDelegate<M> extends {
    findFirst: (args: { where: infer W }) => any;
  }
    ? W
    : never;
}
