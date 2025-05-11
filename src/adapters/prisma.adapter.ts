import { PrismaClient } from "@prisma/client";
import { DBAdapter } from "./db.adapter";

/**
 * Prisma adapter implementation for database operations
 * Provides methods to query and count records using Prisma Client
 */
export class PrismaAdapter implements DBAdapter {
    /**
     * Create a new Prisma adapter
     * @param prisma PrismaClient instance for database connections
     */
    constructor(private readonly prisma: PrismaClient) {}

    /**
     * Find a single record matching the given conditions
     * @param model Name of the Prisma model to query
     * @param where Conditions to match
     * @returns Found record or null if not found
     */
    async findOne(
        model: string,
        where: any
    ): Promise<any> {
        return await this.prisma[model].findFirst({ where });
    }

    /**
     * Count records matching the given conditions
     * @param model Name of the Prisma model to query
     * @param where Conditions to match
     * @returns Number of matching records
     */
    async count(
        model: string,
        where: any
    ): Promise<any> {
        return await this.prisma[model].count({ where });
    }
}
