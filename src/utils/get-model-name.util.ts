import { EntityTarget } from "typeorm";

export const getModelName = (model: string | EntityTarget<any>): string => {
  if (typeof model === "string") {
    return model;
  }
  if ("name" in model) {
    return model.name;
  }
  return model.options.name;
};
