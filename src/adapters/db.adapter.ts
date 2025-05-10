import { EntityName } from "@mikro-orm/core";
import { Model } from "sequelize-typescript";
import { EntityTarget } from "typeorm";
type ModelLiteralValue =
  | string
  | (new () => Model<any, any>)
  | EntityName<any>
  | EntityTarget<any>;
export interface DBAdapter {
  findOne(model: ModelLiteralValue, where: any): Promise<any>;

  count(model: ModelLiteralValue, where: any): Promise<any>;
}
