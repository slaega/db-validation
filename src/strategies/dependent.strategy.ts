import { BadRequestException, HttpException } from "@nestjs/common";
import { DBAdapter } from "src/adapters";

import { isValidRule } from "src/utils/rule-validator.util";
import { ApplyResult, ValidationStrategy } from "./interface.strategy";
import { DbValidationRule } from "src/builders";

export class DependentRuleStrategy implements ValidationStrategy {
  async apply(
    rule: DbValidationRule,
    dBAdapter: DBAdapter
  ): Promise<ApplyResult> {
    if (!isValidRule(rule, "dependent") || rule.type !== "dependent") {
      return { error: null, data: null };
    }
    const found = await dBAdapter.findFirst(rule.model, {
      ...(rule.where as object),
      [rule.dependentField]: rule.expectedValue,
    });

    if (!found) {
      return {
        error: new BadRequestException({
          errors: [
            {
              code: "ERR-007",
              message: rule.message || `Invalid dependent relationship`,
            },
          ],
        }),
      };
    }

    return { error: null, data: found };
  }
}
