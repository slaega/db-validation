import { Model, Sequelize } from "sequelize-typescript";
import { CountOptions, FindOptions } from "sequelize";
import { DBAdapter } from "./db.adapter";

/**
 * Adapter for Sequelize ORM
 * Implements database operations using Sequelize repositories
 */
export class SequelizeAdapter implements DBAdapter {
  constructor(private readonly sequelize: Sequelize) {}

  /**
   * Count records matching the given criteria
   * @param model Model class to query
   * @param where Query conditions
   * @returns Number of matching records
   */
  async count(model: new () => Model<any, any>, where: any): Promise<number> {
    const repository = this.sequelize.getRepository(model);
    const options: CountOptions = { where };
    const result = await repository.count(options);
    return result;
  }

  /**
   * Find a single record matching the given criteria
   * @param model Model class to query
   * @param where Query conditions
   * @returns Found record or null
   */
  async findOne(model: new () => Model<any, any>, where: any): Promise<Model<any, any> | null> {
    const repository = this.sequelize.getRepository(model);
    const options: FindOptions = { where };
    return await repository.findOne(options);
  }
}
