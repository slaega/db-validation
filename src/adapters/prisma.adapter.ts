import { PrismaClient } from "@prisma/client";
import { DBAdapter } from "./db.adapter";


export class PrismaAdapter implements DBAdapter {
    constructor(private readonly prisma: PrismaClient) {}

    async findOne(
        model: string,
        where: any
    ): Promise<any> {
        return await this.prisma[model].findFirst({ where });
    }

    async count(
        model: string,
        where: any
    ): Promise<any> {
        return await this.prisma[model].count({ where });
    }
}
