import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable()
export class LogInterceptor implements NestInterceptor {
    constructor(private readonly loggingService: LoggingService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const actor = request.user ?? {};
        const userId = actor.id ?? request.body?.userId ?? request.query?.userId ?? request.params?.userId ?? null;
        const group = actor.role?.name ?? actor.group ?? 'USER';
        const action = `${request.method} ${request.originalUrl ?? request.url}`;

        return next.handle().pipe(
            finalize(() => {
                void this.loggingService.recordAction({
                    userId,
                    group,
                    action,
                    payload: { body: request.body, query: request.query, params: request.params },
                    ipAddress: request.ip,
                });
            }),
        );
    }
}