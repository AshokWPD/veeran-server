// // src/notification/bill-notification.listener.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';
// import { Bill, Prisma } from '@prisma/client';
// import { PrismaService } from '../core/services/prisma.service';
// import { OneSignalService } from '../core/services/onesignal.service';

// @Injectable()
// export class BillNotificationListener {
//   private readonly logger = new Logger(BillNotificationListener.name);

//   constructor(
//     private prisma: PrismaService,
//     private oneSignalService: OneSignalService,
//   ) {}

//   @OnEvent('bill.generated')
//   async handleBillGeneratedEvent(payload: {
//     billId: string;
//     billNumber: string;
//     totalAmount: number;
//     commission: number;
//     customerName: string;
//     serviceType: string;
//     generatedBy: string;
//     timestamp: Date;
//   }) {
//     this.logger.log(`Processing bill notification: ${payload.billNumber}`);

//     try {
//       // 1. Save to database
//       await this.prisma.notification.create({
//         data: {
//           type: 'BILL_GENERATED',
//           title: `New Bill Generated: ${payload.billNumber}`,
//           message: `Amount: ₹${payload.totalAmount.toFixed(2)} | Customer: ${payload.customerName || 'Guest'}`,
//           data: {
//             billId: payload.billId,
//             billNumber: payload.billNumber,
//             totalAmount: payload.totalAmount,
//             serviceType: payload.serviceType,
//             timestamp: payload.timestamp,
//           },
//           isRead: false,
//         },
//       });

//       // 2. Send push notification
//       await this.oneSignalService.sendNotification({
//         headings: { en: `New Bill: ${payload.billNumber}` },
//         contents: { en: `₹${payload.totalAmount.toFixed(2)} received from ${payload.customerName || 'Customer'}` },
//         data: {
//           type: 'BILL_GENERATED',
//           billId: payload.billId,
//           billNumber: payload.billNumber,
//           amount: payload.totalAmount,
//         },
//         filters: [
//           { field: 'tag', key: 'userRole', relation: '=', value: 'admin' },
//         ],
//       });

//       this.logger.log(`Notification sent for bill: ${payload.billNumber}`);
//     } catch (error) {
//       this.logger.error(`Failed to process notification: ${error.message}`);
//     }
//   }
// }