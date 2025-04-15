import { Module } from '@nestjs/common';
import { DbValidationService } from './db-validation.service';
import { ConfigurableModuleClass } from './config.module-definition';


@Module({
    providers: [DbValidationService],
    exports: [DbValidationService],
})
export class DbValidationModule extends ConfigurableModuleClass {}
