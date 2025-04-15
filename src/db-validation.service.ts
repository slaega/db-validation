import {
    BadRequestException,
    ConflictException,
    HttpException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DbValidationBuilder, DbValidationRule } from './db-validator.builder';
import { DbValidationOptionDto } from './dto/db-validation.dto';
import { MODULE_OPTIONS_TOKEN } from './config.module-definition';

@Injectable()
export class DbValidationService {
    constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: DbValidationOptionDto) {}

    async validate(builder: DbValidationBuilder) {
        const { rules, validateAll } = builder.getRules();

        for (const rule of rules) {
            const error = await this.applyRule(rule);
            if (error && !validateAll) throw error;
            if (error && validateAll) throw error;
        }
    }

    private async applyRule(
        rule: DbValidationRule
    ): Promise<HttpException | null> {
        switch (rule.type) {
            case 'exists': {
                const found = await this.options.prisma[rule.model].findFirst({
                    where: rule.where,
                });
                if (!found)
                    return new NotFoundException({
                        errors: [
                            {
                                code: 'ERR-009',
                                message: rule.message || `Resource not found`,
                            },
                        ],
                    });
                return null;
            }

            case 'unique': {
                const found = await this.options.prisma[rule.model].findFirst({
                    where: rule.where,
                });
                if (
                    found &&
                    (!rule.exclude || !this.matchExclude(found, rule.exclude))
                ) {
                    return new ConflictException({
                        errors: [
                            {
                                code: 'ERR-008',
                                message: rule.message || `Duplicate resource`,
                            },
                        ],
                    });
                }
                return null;
            }

            case 'dependent': {
                const found = await this.options.prisma[rule.model].findFirst({
                    where: rule.where,
                });
                if (
                    !found ||
                    found[rule.dependentField] !== rule.expectedValue
                ) {
                    return new BadRequestException({
                        errors: [
                            {
                                code: 'ERR-007',
                                message:
                                    rule.message ||
                                    `Invalid dependent relationship`,
                            },
                        ],
                    });
                }
                return null;
            }

            case 'equals': {
                if (rule.value !== rule.expected) {
                    return new BadRequestException({
                        errors: [
                            {
                                code: 'ERR-006',
                                message: rule.message || `Values do not match`,
                            },
                        ],
                    });
                }
                return null;
            }

            case 'inList': {
                if (!rule.list.includes(rule.value)) {
                    return new BadRequestException({
                        errors: [
                            {
                                code: 'ERR-005',
                                message: rule.message || `Value not allowed`,
                            },
                        ],
                    });
                }
                return null;
            }

            case 'notInList': {
                if (rule.list.includes(rule.value)) {
                    return new BadRequestException({
                        errors: [
                            {
                                code: 'ERR-005',
                                message: rule.message || `Value not allowed`,
                            },
                        ],
                    });
                }
                return null;
            }

            case 'custom': {
                const result = await rule.validate();
                if (!result) {
                    const ErrorClass =
                        rule.errorType === 'not_found'
                            ? NotFoundException
                            : rule.errorType === 'conflict'
                              ? ConflictException
                              : BadRequestException;

                    return new ErrorClass({
                        errors: [
                            {
                                code: 'ERR-004',
                                message: rule.message || `Validation failed`,
                            },
                        ],
                    });
                }
                return null;
            }

            default:
                return null;
        }
    }

    private matchExclude(found: any, exclude: Record<string, any>): boolean {
        return Object.entries(exclude).every(
            ([key, value]) => found[key] === value
        );
    }
}
