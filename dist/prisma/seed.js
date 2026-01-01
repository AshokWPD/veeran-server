"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting seed...');
    await prisma.transaction.deleteMany();
    await prisma.billItem.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.service.deleteMany();
    await prisma.account.deleteMany();
    await prisma.admin.deleteMany();
    console.log('Cleared existing data');
    console.log('Creating admins...');
    const admins = await Promise.all(Array.from({ length: 5 }).map(async (_, i) => {
        const isSuperAdmin = i === 0;
        const hashedPassword = await bcrypt.hash('password123', 10);
        return prisma.admin.create({
            data: {
                email: isSuperAdmin
                    ? 'superadmin@example.com'
                    : faker_1.faker.internet.email(),
                password: hashedPassword,
                name: faker_1.faker.person.fullName(),
                role: isSuperAdmin
                    ? 'superadmin'
                    : faker_1.faker.helpers.arrayElement(['admin', 'staff', 'cashier']),
                isActive: faker_1.faker.datatype.boolean(0.9),
                isSuperAdmin,
            },
        });
    }));
    console.log(`Created ${admins.length} admins`);
    console.log('Creating accounts...');
    const accountTypes = ['Bank', 'Cash', 'Wallet', 'Porter', 'GPay'];
    const accounts = await Promise.all(accountTypes.map((type, index) => prisma.account.create({
        data: {
            name: `${type} Account ${index + 1}`,
            type,
            accountNumber: type !== 'Cash' ? faker_1.faker.finance.accountNumber() : null,
            balance: faker_1.faker.number.float({
                min: 1000,
                max: 50000,
                fractionDigits: 2,
            }),
            holderName: faker_1.faker.person.fullName(),
            description: faker_1.faker.definitions.finance.account_type.toString(),
            isActive: true,
        },
    })));
    console.log(`Created ${accounts.length} accounts`);
    console.log('Creating services...');
    const serviceCategories = [
        'Banking',
        'Digital',
        'Printing',
        'Money_Exchange',
        'Online_Services',
    ];
    const serviceTypes = [
        'FIXED_PRICE',
        'PERCENTAGE_COMMISSION',
        'VARIABLE_PRICE',
    ];
    const services = await Promise.all(Array.from({ length: 20 }).map(() => {
        const serviceType = faker_1.faker.helpers.arrayElement(serviceTypes);
        const hasOnlineCharge = faker_1.faker.datatype.boolean(0.3);
        return prisma.service.create({
            data: {
                name: faker_1.faker.company.name() + ' Service',
                category: faker_1.faker.helpers.arrayElement(serviceCategories),
                serviceType,
                defaultPrice: faker_1.faker.number.float({
                    min: 5,
                    max: 1000,
                    fractionDigits: 2,
                }),
                commissionRate: serviceType === 'PERCENTAGE_COMMISSION'
                    ? faker_1.faker.number.float({ min: 1, max: 10, fractionDigits: 2 })
                    : null,
                minAmount: serviceType === 'VARIABLE_PRICE'
                    ? faker_1.faker.number.float({ min: 10, max: 100, fractionDigits: 2 })
                    : null,
                maxAmount: serviceType === 'VARIABLE_PRICE'
                    ? faker_1.faker.number.float({ min: 200, max: 10000, fractionDigits: 2 })
                    : null,
                hasOnlineCharge,
                onlineCharge: hasOnlineCharge
                    ? faker_1.faker.number.float({ min: 5, max: 50, fractionDigits: 2 })
                    : null,
                description: faker_1.faker.lorem.sentence(),
                instructions: faker_1.faker.lorem.paragraph(),
                isActive: faker_1.faker.datatype.boolean(0.85),
            },
        });
    }));
    console.log(`Created ${services.length} services`);
    console.log('Creating customers...');
    const customers = await Promise.all(Array.from({ length: 50 }).map(() => prisma.customer.create({
        data: {
            name: faker_1.faker.person.fullName(),
            phone: faker_1.faker.phone.number(),
            notes: faker_1.faker.datatype.boolean(0.3) ? faker_1.faker.lorem.sentence() : null,
        },
    })));
    console.log(`Created ${customers.length} customers`);
    console.log('Creating bills and bill items...');
    const paymentModes = ['Cash', 'GPay', 'PhonePe', 'Porter', 'Card'];
    const billStatuses = ['ACTIVE', 'CANCELLED', 'REFUNDED'];
    const paymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
    const serviceTypesBill = ['QUICK_SERVICE', 'MONEY_EXCHANGE', 'REGULAR_BILL'];
    for (let i = 0; i < 100; i++) {
        const customer = faker_1.faker.helpers.arrayElement(customers);
        const account = faker_1.faker.helpers.arrayElement(accounts);
        const billStatus = faker_1.faker.helpers.arrayElement(billStatuses);
        const paymentStatus = faker_1.faker.helpers.arrayElement(paymentStatuses);
        const bill = await prisma.bill.create({
            data: {
                billNumber: `BILL-${String(i + 1).padStart(3, '0')}`,
                customerId: customer.id,
                customerName: customer.name,
                customerPhone: customer.phone,
                totalAmount: 0,
                taxAmount: 0,
                discount: faker_1.faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
                netAmount: 0,
                commission: 0,
                profit: 0,
                paymentMode: faker_1.faker.helpers.arrayElement(paymentModes),
                paymentStatus,
                billStatus,
                accountId: paymentStatus === 'PAID' ? account.id : null,
                notes: faker_1.faker.datatype.boolean(0.2) ? faker_1.faker.lorem.sentence() : null,
                serviceType: faker_1.faker.helpers.arrayElement(serviceTypesBill),
            },
        });
        const itemCount = faker_1.faker.number.int({ min: 1, max: 5 });
        let totalAmount = 0;
        let totalCommission = 0;
        let totalProfit = 0;
        for (let j = 0; j < itemCount; j++) {
            const service = faker_1.faker.helpers.arrayElement(services);
            const quantity = faker_1.faker.number.int({ min: 1, max: 3 });
            const price = faker_1.faker.number.float({
                min: 10,
                max: 500,
                fractionDigits: 2,
            });
            const costPrice = price * faker_1.faker.number.float({ min: 0.5, max: 0.9, fractionDigits: 2 });
            const commission = faker_1.faker.number.float({
                min: 0,
                max: price * 0.1,
                fractionDigits: 2,
            });
            const profit = price - (costPrice || 0) + commission;
            const itemTotal = quantity * price;
            await prisma.billItem.create({
                data: {
                    billId: bill.id,
                    serviceId: service.id,
                    itemType: 'SERVICE',
                    itemName: service.name,
                    quantity,
                    price,
                    costPrice,
                    commission,
                    profit,
                    totalAmount: itemTotal,
                },
            });
            totalAmount += itemTotal;
            totalCommission += commission;
            totalProfit += profit;
        }
        const taxAmount = totalAmount * 0.18;
        const netAmount = totalAmount + taxAmount - bill.discount;
        await prisma.bill.update({
            where: { id: bill.id },
            data: {
                totalAmount,
                taxAmount,
                netAmount,
                commission: totalCommission,
                profit: totalProfit,
            },
        });
    }
    console.log('Created 100 bills with items');
    console.log('Creating transactions...');
    const transactionDirections = ['IN', 'OUT'];
    const transactionTypes = [
        'SELF_TRANSFER',
        'SERVICE',
        'PRODUCT_SALE',
        'PURCHASE',
        'COMMISSION',
        'MONEY_EXCHANGE',
    ];
    const transactionStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];
    for (let i = 0; i < 200; i++) {
        const account = faker_1.faker.helpers.arrayElement(accounts);
        const relatedAccount = faker_1.faker.datatype.boolean(0.3)
            ? faker_1.faker.helpers.arrayElement(accounts.filter((acc) => acc.id !== account.id))
            : null;
        const direction = faker_1.faker.helpers.arrayElement(transactionDirections);
        const amount = faker_1.faker.number.float({
            min: 10,
            max: 5000,
            fractionDigits: 2,
        });
        const commission = faker_1.faker.number.float({
            min: 0,
            max: amount * 0.05,
            fractionDigits: 2,
        });
        const netAmount = direction === 'IN' ? amount - commission : amount + commission;
        const profit = faker_1.faker.number.float({
            min: 0,
            max: amount * 0.02,
            fractionDigits: 2,
        });
        const metadata = faker_1.faker.datatype.boolean(0.2)
            ? {
                note: faker_1.faker.lorem.sentence(),
                location: faker_1.faker.location.city(),
                timestamp: faker_1.faker.date.recent().toISOString(),
            }
            : undefined;
        await prisma.transaction.create({
            data: {
                accountId: account.id,
                amount,
                direction,
                type: faker_1.faker.helpers.arrayElement(transactionTypes),
                subType: faker_1.faker.helpers.arrayElement([
                    'CASH_TO_GPAY',
                    'GPAY_TO_CASH',
                    'BIO_METRIC_WITHDRAWAL',
                    null,
                ]),
                description: faker_1.faker.finance.transactionDescription(),
                status: faker_1.faker.helpers.arrayElement(transactionStatuses),
                referenceNumber: faker_1.faker.finance.routingNumber(),
                relatedAccountId: relatedAccount?.id || null,
                commission,
                netAmount,
                profit,
                metadata,
            },
        });
    }
    console.log('Created 200 transactions');
    console.log('Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map