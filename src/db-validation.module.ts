// src/db-validation.module.ts
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DbValidationService } from './db-validation.service';
import { DBAdapter } from './adapters';
import { DATABASE_ADAPTER, ERROR_FORMATTER } from './constant'

export interface DbValidationModuleAsyncOptions<T extends any[] = any[]> {
  imports?: any[];
  useFactory: (...args: T) => {
    adapter: DBAdapter;
    /**
     * Optional custom formatter: return any shape. Receives errors with code, message, where, and optional details.
     */
    errorFormatter?: (errors: Array<{ code: string; message: string; where: Record<string, any>; details?: any }>) => any;
  };
  inject?: any[];
}

function extractFieldPaths(obj: Record<string, any>, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      return value.flatMap((item, index) =>
        extractFieldPaths(item, `${path}[${index}]`)
      );
    } else if (typeof value === 'object' && value !== null) {
      return extractFieldPaths(value, path);
    } else {
      return path;
    }
  });
}

@Module({})
export class DbValidationModule {
  static registerAsync<T extends any[] = any[]>(
    options: DbValidationModuleAsyncOptions<T>
  ): DynamicModule {
    const adapterProvider: Provider = {
      provide: DATABASE_ADAPTER,
      useFactory: (...args: any[]) => options.useFactory(...(args as T)).adapter,
      inject: options.inject || [],
    };

    // Enhanced default formatter: includes code, message, full paths of fields, and optional details
    const defaultFormatter = (
      errs: Array<{ code: string; message: string; where: Record<string, any>; details?: any }>
    ) => ({
      errors: errs.map(e => ({
        code: e.code,
        message: e.message,
        fields: extractFieldPaths(e.where || {}),
        ...(e.details ? { details: e.details } : {}),
      })),
    });

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
