import { MikroORM, EntityName } from "@mikro-orm/core";
import { DBAdapter } from "./db.adapter";

/**
 * MikroORM adapter implementation for database operations
 * Provides methods to query and count records using MikroORM's EntityManager
 */
export class MicroOrmAdapter implements DBAdapter {
  /**
   * Create a new MikroORM adapter
   * @param mikroORM MikroORM instance for database connections
   */
  constructor(private readonly mikroORM: MikroORM) {}

  /**
   * Count records matching the given conditions
   * @param model Entity model to query
   * @param where Conditions to match
   * @returns Number of matching records
   */
  async count(model: EntityName<any>, where: any): Promise<any> {
    const repository = this.mikroORM.em.getRepository(model);
    return await repository.count(where);
  }

  /**
   * Find a single record matching the given conditions
   * @param model Entity model to query
   * @param where Conditions to match
   * @returns Found record or null if not found
   */
  async findOne(model: EntityName<any>, where: any): Promise<any> {
    const repository = this.mikroORM.em.getRepository(model);
    return await repository.findOne(where);
  }
}
