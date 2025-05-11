import { EntityTarget } from 'typeorm';
import { EntityName as MicroEntityName } from '@mikro-orm/core';
import { OrmConfig } from '../types';

/**
 * Convert a model to the appropriate type for a specific ORM
 * @param model Model to convert
 * @param orm ORM type
 * @returns Converted model type
 */
export function convertModelType<T extends keyof OrmConfig>(
  model: OrmConfig[T]['model'],
  orm: T
): OrmConfig[T]['model'] {
  switch (orm) {
    case 'prisma':
      return String(model);
    case 'typeorm':
      return model as EntityTarget<any>;
    case 'micro-orm':
      return model as MicroEntityName<any>;
    case 'sequilize':
      return model as new () => any;
    default:
      return model;
  }
}
