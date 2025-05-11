import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DbValidationService } from './db-validation.service';
import { DATABASE_ADAPTER, ERROR_FORMATTER } from './constant'
import { DbValidationModuleAsyncOptions } from './dto/db-validation.dto';
import { defaultFormatter } from './utils/formator.util';

/**
 * Module for database validation functionality
 * Provides validation services and error formatting
 */
@Module({})
export class DbValidationModule {
  /**
   * Register the module asynchronously with custom providers
   * @param options Module configuration options
   * @returns Dynamic module configuration
   */
  static registerAsync<T extends any[] = any[]>(
    options: DbValidationModuleAsyncOptions<T>
  ): DynamicModule {
    // Database adapter provider
    const adapterProvider: Provider = {
      provide: DATABASE_ADAPTER,
      useFactory: (...args: any[]) => options.useFactory(...(args as T)).adapter,
      inject: options.inject || [],
    };

    // Error formatter provider
    // Uses custom formatter if provided, falls back to default formatter
    const formatterProvider: Provider = {
      provide: ERROR_FORMATTER,
      useFactory: (...args: any[]) => {
        const result = options.useFactory(...(args as T));
        return result.errorFormatter || defaultFormatter;
      },
      inject: options.inject || [],
    };

    return {
      module: DbValidationModule,
      imports: options.imports || [],
      providers: [adapterProvider, formatterProvider, DbValidationService],
      exports: [DbValidationService],
    };
  }
}
