import { Model, Sequelize } from "sequelize-typescript";
import { DBAdapter } from "./db.adapter";

export class SequelizeAdapter implements DBAdapter {
  constructor(private readonly sequelize: Sequelize) {}
  async count(model: new () => Model<any, any>, where: any): Promise<any> {
    const repository = this.sequelize.getRepository(model);
    return await repository.count(where);
  }

  async findOne(model: new () => Model<any, any>, where: any): Promise<any> {
    const repository = this.sequelize.getRepository(model);
    return await repository.findOne(where);
  }
}

