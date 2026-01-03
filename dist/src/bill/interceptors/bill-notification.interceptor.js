"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BillNotificationInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillNotificationInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const event_emitter_1 = require("@nestjs/event-emitter");
let BillNotificationInterceptor = BillNotificationInterceptor_1 = class BillNotificationInterceptor {
    eventEmitter;
    logger = new common_1.Logger(BillNotificationInterceptor_1.name);
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.tap)((bill) => {
            if (bill && bill.billNumber && bill.totalAmount !== undefined) {
                this.logger.log(`Bill generated: ${bill.billNumber}`);
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
        }));
    }
};
exports.BillNotificationInterceptor = BillNotificationInterceptor;
exports.BillNotificationInterceptor = BillNotificationInterceptor = BillNotificationInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], BillNotificationInterceptor);
//# sourceMappingURL=bill-notification.interceptor.js.map