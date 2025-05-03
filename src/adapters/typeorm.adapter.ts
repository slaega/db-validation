import { DataSource } from 'typeorm';
import { DBAdapter } from './db.adapter';

export class TypeORMAdapter implements DBAdapter {
    constructor(private readonly dataSource: DataSource) {}

    async findFirst(
        model: string,
        where: any
    ): Promise<any> {
        const repository = this.dataSource.getRepository(model);
        return await repository.findOneBy(where);
    }
}
