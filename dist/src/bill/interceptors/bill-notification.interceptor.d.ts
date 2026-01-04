import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class BillNotificationInterceptor implements NestInterceptor {
    private eventEmitter;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
