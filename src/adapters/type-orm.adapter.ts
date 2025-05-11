import { DataSource, EntityTarget } from 'typeorm';
import { DBAdapter } from './db.adapter';

/**
 * TypeORM adapter implementation for database operations
 * Provides methods to query and count records using TypeORM's DataSource
 */
export class TypeOrmAdapter implements DBAdapter {
    /**
     * Create a new TypeORM adapter
     * @param dataSource TypeORM DataSource instance for database connections
     */
    constructor(private readonly dataSource: DataSource) {}

    /**
     * Count records matching the given conditions
     * @param model Entity model to query
     * @param where Conditions to match
     * @returns Number of matching records
     */
    async count(model: EntityTarget<any>, where: any): Promise<any> {
        const repository = this.dataSource.getRepository(model);
        return await repository.countBy(where);
    }

    /**
     * Find a single record matching the given conditions
     * @param model Entity model to query
     * @param where Conditions to match
     * @returns Found record or null if not found
     */
    async findOne(
        model: EntityTarget<any>,
        where: any
    ): Promise<any> {
        const repository = this.dataSource.getRepository(model);
        return await repository.findOneBy(where);
    }
}
