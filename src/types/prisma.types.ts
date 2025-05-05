import { PrismaClient } from "@prisma/client";

export namespace Prisma {
    export type FilterOutDollar<T> = T extends `$${string}` ? never : T;
    export type PrismaModel =  FilterOutDollar<keyof PrismaClient>;
    export type PrismaDelegate<M extends string | symbol> = M extends keyof FilterOutDollar<PrismaClient>
        ? PrismaClient[M]
        : never;

        export type WhereForModel<M extends string | symbol> = PrismaDelegate<M> extends { findFirst: (...args: any) => any }
        ? Parameters<PrismaDelegate<M>["findFirst"]>[0]["where"]
        : never;
}
