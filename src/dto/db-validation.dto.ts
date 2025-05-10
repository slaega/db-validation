import { DBAdapter } from "../adapters";

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