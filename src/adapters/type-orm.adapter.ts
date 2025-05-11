import { DataSource, EntityTarget } from 'typeorm';
import { DBAdapter } from './db.adapter';

export class TypeOrmAdapter implements DBAdapter {
    constructor(private readonly dataSource: DataSource) {}
    async count(model: EntityTarget<any>, where: any): Promise<any> {
        const repository = this.dataSource.getRepository(model);
        return await repository.countBy(where);
    }

    async findOne(
        model: EntityTarget<any>,
        where: any
    ): Promise<any> {
        const repository = this.dataSource.getRepository(model);
        return await repository.findOneBy(where);
    }
}
