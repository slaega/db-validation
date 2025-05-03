import { PrismaClient } from "@prisma/client";
import { DBAdapter } from "./db.adapter";


export class PrismaAdapter implements DBAdapter {
    constructor(private readonly prisma: PrismaClient) {}

    async findFirst(
        model: string,
        where: any
    ): Promise<any> {
        return await this.prisma[model].findFirst({ where });
    }
}
