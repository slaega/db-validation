import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DataSource } from 'typeorm';

import { PrismaAdapter, TypeORMAdapter } from './adapters';
import { ConfigurableModuleClass, DATABASE_ADAPTER } from './config.module-definition';
import { DbValidationService } from './db-validation.service';
import { DbValidationOptionDto } from './dto/db-validation.dto';

/**
 * Module for database validation functionality.
 * Supports both Prisma and TypeORM as underlying ORMs.
 */
@Module({
  providers: [DbValidationService],
  exports: [DbValidationService],
})
export class DbValidationModule extends ConfigurableModuleClass {
  /**
   * Registers the DbValidationModule with the specified options.
   * @param options - Configuration options for the module
   * @returns A dynamic module configuration
   */
  static register(options: DbValidationOptionDto): DynamicModule {
    const defaultOptions: Required<DbValidationOptionDto> = {
      orm: "prisma",
      injectToken: "default",
    };

    const finalOptions = { ...defaultOptions, ...options };

    const adapterProvider: Provider = this.createAdapterProvider(finalOptions);

    return {
      ...super.register(finalOptions),
      providers: [...super.register(finalOptions).providers, adapterProvider],
      exports: [DbValidationService],
    };
  }

  /**
   * Creates a provider for the database adapter based on the specified ORM.
   * @param options - Configuration options containing the ORM type and injection token
   * @returns A provider configuration for the database adapter
   * @throws Error if an unsupported ORM is specified
   */
  private static createAdapterProvider(
    options: DbValidationOptionDto
  ): Provider {
    if (options.orm === "typeorm") {
      const injectToken =
        options.injectToken === "default" ? DataSource : options.injectToken;
      return {
        provide: DATABASE_ADAPTER,
        useFactory: (dataSource: DataSource) => new TypeORMAdapter(dataSource),
        inject: [injectToken],
      };
    } else if (options.orm === "prisma") {
      const injectToken =
        options.injectToken === "default" ? PrismaClient : options.injectToken;
      return {
        provide: DATABASE_ADAPTER,
        useFactory: (prismaClient: PrismaClient) =>
          new PrismaAdapter(prismaClient),
        inject: [injectToken],
      };
    } else {
      throw new Error(`Unsupported ORM: ${options.orm}`);
    }
  }
}
