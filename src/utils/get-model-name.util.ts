import { EntityTarget } from "typeorm";
import { EntityName as MicroEntityName } from '@mikro-orm/core';

type ModelType = string | EntityTarget<any> | MicroEntityName<any> | (new () => any) | { name: string; type: any };

/**
 * Get the model name from a model class, string, or entity
 * @param model Model class, name, or entity
 * @returns Model name as string
 */
export function getModelName(model: ModelType): string {
  if (typeof model === 'string') return model;
  if (typeof model === 'function') return model.name;
  if (model && typeof model === 'object' && 'name' in model) return String(model.name);
  return String(model);
}
