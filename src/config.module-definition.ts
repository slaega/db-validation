import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DbValidationOptionDto } from './dto/db-validation.dto';
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<DbValidationOptionDto>()
    .setClassMethodName('forRoot')
    .build();