import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DbValidationOptionDto } from './dto/db-validation.dto';
export const DATABASE_ADAPTER = Symbol('DATABASE_ADAPTER');

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<DbValidationOptionDto>()
    .setClassMethodName('register')
    .build();