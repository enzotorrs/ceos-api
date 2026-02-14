import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiDataResponse = <TModel extends Type<any>>(model: TModel | [TModel]) => {
    const isArray = Array.isArray(model);
    const targetModel = isArray ? model[0] : model;

    return applyDecorators(
        ApiExtraModels(targetModel),
        ApiOkResponse({
            schema: {
                properties: {
                    data: isArray
                        ? {
                            type: 'array',
                            items: { $ref: getSchemaPath(targetModel) },
                        }
                        : {
                            $ref: getSchemaPath(targetModel),
                        },
                },
            },
        }),
    );
};
