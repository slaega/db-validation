import { EntityManager, EntityName } from "@mikro-orm/core";
import { DBAdapter } from "./db.adapter";

export class MicroOrmAdapter implements DBAdapter {
  constructor(private readonly entityManager: EntityManager) {}
  async count(model: EntityName<any>, where: any): Promise<any> {
    const repository = this.entityManager.getRepository(model);
    return await repository.count(where);
  }

  async findOne(model: EntityName<any>, where: any): Promise<any> {
    const repository = this.entityManager.getRepository(model);
    return await repository.findOne(where);
  }
}
