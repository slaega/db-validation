type ModelWhereMapping = Record<any, Record<string, any>>;


export type WhereType<M extends keyof ModelWhereMapping> = ModelWhereMapping[M];
export interface ExistsValidationRule<M extends keyof ModelWhereMapping> {
    type: 'exists';
    model: M;
    where: WhereType<M>;
    message?: string;
}
export interface UniqueValidationRule<M extends keyof ModelWhereMapping> {
    type: 'unique';
    model: M;
    where: WhereType<M>;
    exclude?: Record<string, any>;
    message?: string;
}

export interface DependentValidationRule<M extends keyof ModelWhereMapping> {
    type: 'dependent';
    model: M;
    where: WhereType<M>;
    dependentField: string;
    expectedValue: any;
    message?: string;
}
export type DbValidationRule =
    | ExistsValidationRule<keyof ModelWhereMapping>
    | UniqueValidationRule<keyof ModelWhereMapping>
    | DependentValidationRule<keyof ModelWhereMapping>
// | {
//       type: 'custom';
//       validate: () => Promise<boolean>;
//       message?: string;
//       errorType?: 'bad_request' | 'conflict' | 'not_found';
// };

// Validation Builder
export interface ValidationBuilderI {


    getRules(): { rules: DbValidationRule[]; validateAll: boolean };
}
