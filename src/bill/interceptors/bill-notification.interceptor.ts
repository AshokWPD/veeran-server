import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BillNotificationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(BillNotificationInterceptor.name);

  constructor(private eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((bill) => {
        // Check if the response is a bill object
        if (bill && bill.billNumber && bill.totalAmount !== undefined) {
          this.logger.log(`Bill generated: ${bill.billNumber}`);
          
          // Emit bill generated event
          this.eventEmitter.emit('bill.generated', {
            billId: bill.id,
            billNumber: bill.billNumber,
            totalAmount: bill.totalAmount,
            commission: bill.commission || 0,
            customerName: bill.customerName,
            serviceType: bill.serviceType,
            generatedBy: 'system',
            timestamp: new Date(),
          });
        }
      }),
    );
  }
}