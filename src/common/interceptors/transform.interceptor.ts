import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { IGNORE_TRANSFORM_KEY } from '../decorators/ignore-transform.decorator';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T> | any
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | any> {
    const ignoreTransform = this.reflector.getAllAndOverride<boolean>(
      IGNORE_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (ignoreTransform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'meta' in data) {
          const { meta, ...rest } = data;
          return {
            data: rest.data || rest.items || rest,
            meta,
          };
        }
        return { data };
      }),
    );
  }
}
