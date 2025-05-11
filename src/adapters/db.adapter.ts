import { EntityName } from "@mikro-orm/core";
import { Model } from "sequelize-typescript";
import { EntityTarget } from "typeorm";

/**
 * Union type for all supported model types across different ORMs
 * Includes:
 * - Prisma: string
 * - Sequelize: Model class
 * - MikroORM: EntityName
 * - TypeORM: EntityTarget
 */
type ModelLiteralValue =
  | string
  | (new () => Model<any, any>)
  | EntityName<any>
  | EntityTarget<any>;

/**
 * Common interface for all database adapters
 * Provides a unified way to query and count records
 * regardless of the underlying ORM
 */
export interface DBAdapter {
  /**
   * Find a single record matching the given conditions
   * @param model Model to query (type varies by ORM)
   * @param where Conditions to match
   * @returns Found record or null if not found
   */
  findOne(model: ModelLiteralValue, where: any): Promise<any>;

  /**
   * Count records matching the given conditions
   * @param model Model to query (type varies by ORM)
   * @param where Conditions to match
   * @returns Number of matching records
   */
  count(model: ModelLiteralValue, where: any): Promise<any>;
}
