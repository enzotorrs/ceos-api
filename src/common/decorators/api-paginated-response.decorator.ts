import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        ApiExtraModels(model),
        ApiOkResponse({
            schema: {
                properties: {
                    data: {
                        type: 'array',
                        items: { $ref: getSchemaPath(model) },
                    },
                    meta: {
                        type: 'object',
                        properties: {
                            total: { type: 'number' },
                            page: { type: 'number' },
                            lastPage: { type: 'number' },
                        },
                    },
                },
            },
        }),
    );
};
