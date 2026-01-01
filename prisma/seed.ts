import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.account.deleteMany();
  await prisma.admin.deleteMany();

  console.log('Cleared existing data');

  // Create Admins
  console.log('Creating admins...');
  const admins = await Promise.all(
    Array.from({ length: 5 }).map(async (_, i) => {
      const isSuperAdmin = i === 0;
      const hashedPassword = await bcrypt.hash('password123', 10);

      return prisma.admin.create({
        data: {
          email: isSuperAdmin
            ? 'superadmin@example.com'
            : faker.internet.email(),
          password: hashedPassword,
          name: faker.person.fullName(),
          role: isSuperAdmin
            ? 'superadmin'
            : faker.helpers.arrayElement(['admin', 'staff', 'cashier']),
          isActive: faker.datatype.boolean(0.9), // 90% chance of being active
          isSuperAdmin,
        },
      });
    }),
  );
  console.log(`Created ${admins.length} admins`);

  // Create Accounts
  console.log('Creating accounts...');
  const accountTypes = ['Bank', 'Cash', 'Wallet', 'Porter', 'GPay'];
  const accounts = await Promise.all(
    accountTypes.map((type, index) =>
      prisma.account.create({
        data: {
          name: `${type} Account ${index + 1}`,
          type,
          accountNumber: type !== 'Cash' ? faker.finance.accountNumber() : null,
          balance: faker.number.float({
            min: 1000,
            max: 50000,
            fractionDigits: 2,
          }),
          holderName: faker.person.fullName(),
          description: faker.definitions.finance.account_type.toString(),
          isActive: true,
        },
      }),
    ),
  );
  console.log(`Created ${accounts.length} accounts`);

  // Create Services
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

  const services = await Promise.all(
    Array.from({ length: 20 }).map(() => {
      const serviceType = faker.helpers.arrayElement(serviceTypes);
      const hasOnlineCharge = faker.datatype.boolean(0.3); // 30% chance

      return prisma.service.create({
        data: {
          name: faker.company.name() + ' Service',
          category: faker.helpers.arrayElement(serviceCategories),
          serviceType,
          defaultPrice: faker.number.float({
            min: 5,
            max: 1000,
            fractionDigits: 2,
          }),
          commissionRate:
            serviceType === 'PERCENTAGE_COMMISSION'
              ? faker.number.float({ min: 1, max: 10, fractionDigits: 2 })
              : null,
          minAmount:
            serviceType === 'VARIABLE_PRICE'
              ? faker.number.float({ min: 10, max: 100, fractionDigits: 2 })
              : null,
          maxAmount:
            serviceType === 'VARIABLE_PRICE'
              ? faker.number.float({ min: 200, max: 10000, fractionDigits: 2 })
              : null,
          hasOnlineCharge,
          onlineCharge: hasOnlineCharge
            ? faker.number.float({ min: 5, max: 50, fractionDigits: 2 })
            : null,
          description: faker.lorem.sentence(),
          instructions: faker.lorem.paragraph(),
          isActive: faker.datatype.boolean(0.85), // 85% chance of being active
        },
      });
    }),
  );
  console.log(`Created ${services.length} services`);

  // Create Customers
  console.log('Creating customers...');
  const customers = await Promise.all(
    Array.from({ length: 50 }).map(() =>
      prisma.customer.create({
        data: {
          name: faker.person.fullName(),
          phone: faker.phone.number(), // Fixed: removed the format parameter
          notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null, // 30% chance of having notes
        },
      }),
    ),
  );
  console.log(`Created ${customers.length} customers`);

  // Create Bills and Bill Items
  console.log('Creating bills and bill items...');
  const paymentModes = ['Cash', 'GPay', 'PhonePe', 'Porter', 'Card'];
  const billStatuses = ['ACTIVE', 'CANCELLED', 'REFUNDED'];
  const paymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
  const serviceTypesBill = ['QUICK_SERVICE', 'MONEY_EXCHANGE', 'REGULAR_BILL'];

  for (let i = 0; i < 100; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const account = faker.helpers.arrayElement(accounts);
    const billStatus = faker.helpers.arrayElement(billStatuses);
    const paymentStatus = faker.helpers.arrayElement(paymentStatuses);

    const bill = await prisma.bill.create({
      data: {
        billNumber: `BILL-${String(i + 1).padStart(3, '0')}`,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        totalAmount: 0, // Will be updated after creating items
        taxAmount: 0,
        discount: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
        netAmount: 0, // Will be updated
        commission: 0,
        profit: 0,
        paymentMode: faker.helpers.arrayElement(paymentModes),
        paymentStatus,
        billStatus,
        accountId: paymentStatus === 'PAID' ? account.id : null,
        notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : null,
        serviceType: faker.helpers.arrayElement(serviceTypesBill),
      },
    });

    // Create bill items
    const itemCount = faker.number.int({ min: 1, max: 5 });
    let totalAmount = 0;
    let totalCommission = 0;
    let totalProfit = 0;

    for (let j = 0; j < itemCount; j++) {
      const service = faker.helpers.arrayElement(services);
      const quantity = faker.number.int({ min: 1, max: 3 });
      const price = faker.number.float({
        min: 10,
        max: 500,
        fractionDigits: 2,
      });
      const costPrice =
        price * faker.number.float({ min: 0.5, max: 0.9, fractionDigits: 2 });
      const commission = faker.number.float({
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

    // Update bill with calculated amounts
    const taxAmount = totalAmount * 0.18; // 18% GST
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

  // Create Transactions
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
    const account = faker.helpers.arrayElement(accounts);
    const relatedAccount = faker.datatype.boolean(0.3)
      ? faker.helpers.arrayElement(
          accounts.filter((acc) => acc.id !== account.id),
        )
      : null;
    const direction = faker.helpers.arrayElement(transactionDirections);
    const amount = faker.number.float({
      min: 10,
      max: 5000,
      fractionDigits: 2,
    });
    const commission = faker.number.float({
      min: 0,
      max: amount * 0.05,
      fractionDigits: 2,
    });
    const netAmount =
      direction === 'IN' ? amount - commission : amount + commission;
    const profit = faker.number.float({
      min: 0,
      max: amount * 0.02,
      fractionDigits: 2,
    });

    // Create metadata object properly
    const metadata = faker.datatype.boolean(0.2)
      ? {
          note: faker.lorem.sentence(),
          location: faker.location.city(),
          timestamp: faker.date.recent().toISOString(),
        }
      : undefined;

    await prisma.transaction.create({
      data: {
        accountId: account.id,
        amount,
        direction,
        type: faker.helpers.arrayElement(transactionTypes),
        subType: faker.helpers.arrayElement([
          'CASH_TO_GPAY',
          'GPAY_TO_CASH',
          'BIO_METRIC_WITHDRAWAL',
          null,
        ]),
        description: faker.finance.transactionDescription(),
        status: faker.helpers.arrayElement(transactionStatuses),
        referenceNumber: faker.finance.routingNumber(),
        relatedAccountId: relatedAccount?.id || null,
        commission,
        netAmount,
        profit,
        metadata, // Fixed: use undefined instead of null for Prisma Json type
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
