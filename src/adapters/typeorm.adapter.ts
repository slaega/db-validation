import { DataSource } from 'typeorm';
import { DatabaseService } from './i-database.service';

export class TypeORMAdapter implements DatabaseService {
    constructor(private readonly dataSource: DataSource) {}

    async findFirst(
        model: string,
        where: any
    ): Promise<any> {
        const repository = this.dataSource.getRepository(model);
        return await repository.findOneBy(where);
    }
}
