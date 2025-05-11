import { MikroORM, EntityName } from "@mikro-orm/core";
import { DBAdapter } from "./db.adapter";

export class MicroOrmAdapter implements DBAdapter {
  constructor(private readonly mikroORM: MikroORM) {}
  async count(model: EntityName<any>, where: any): Promise<any> {
    const repository = this.mikroORM.em.getRepository(model);
    return await repository.count(where);
  }

  async findOne(model: EntityName<any>, where: any): Promise<any> {
    const repository = this.mikroORM.em.getRepository(model);
    return await repository.findOne(where);
  }
}
