import { PrismaClient } from "@prisma/client";
import { DatabaseService } from "./i-database.service";


export class PrismaAdapter implements DatabaseService {
    constructor(private readonly prisma: PrismaClient) {}

    async findFirst(
        model: string,
        where: any
    ): Promise<any> {
        return await this.prisma[model].findFirst({ where });
    }
}
