import { PrismaValidationBuilder } from "../builders";
import { TypeORMValidationBuilder } from "../builders";
import { UnTypedDbValidationBuilder } from "../builders";

export class ValidationBuilderFactory {
    static forPrisma(): PrismaValidationBuilder {
        return PrismaValidationBuilder.create();
    }

    static forTypeORM(): TypeORMValidationBuilder {
        return TypeORMValidationBuilder.create();
    }
    static build(): UnTypedDbValidationBuilder {
        return UnTypedDbValidationBuilder.create();
    }
}
