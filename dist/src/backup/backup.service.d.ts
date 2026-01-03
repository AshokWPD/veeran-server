import { PrismaService } from '../core/services/prisma.service';
export declare class BackupService {
    private prisma;
    constructor(prisma: PrismaService);
    fullDataExport(): Promise<{
        accounts: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            accountNumber: string | null;
            balance: number;
            holderName: string | null;
            description: string | null;
        }[];
        transactions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            description: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            netAmount: number;
            commission: number;
            profit: number;
            accountId: string;
            billId: string | null;
            amount: number;
            direction: string;
            subType: string | null;
            status: string;
            referenceNumber: string | null;
            relatedAccountId: string | null;
        }[];
        services: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            serviceType: string;
            defaultPrice: number;
            commissionRate: number | null;
            minAmount: number | null;
            maxAmount: number | null;
            hasOnlineCharge: boolean;
            onlineCharge: number | null;
            instructions: string | null;
        }[];
        bills: ({
            customer: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string;
                notes: string | null;
            } | null;
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                totalAmount: number;
                commission: number;
                profit: number;
                itemType: string;
                itemName: string;
                quantity: number;
                price: number;
                costPrice: number | null;
                billId: string;
                serviceId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            serviceType: string | null;
            notes: string | null;
            billNumber: string;
            customerName: string | null;
            customerPhone: string | null;
            totalAmount: number;
            taxAmount: number;
            discount: number;
            netAmount: number;
            commission: number;
            profit: number;
            paymentMode: string;
            paymentStatus: string;
            billStatus: string;
            accountId: string | null;
            splitPayments: import("@prisma/client/runtime/library").JsonValue | null;
            accountTransactions: import("@prisma/client/runtime/library").JsonValue | null;
            customerId: string | null;
        })[];
        customers: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            notes: string | null;
        }[];
    }>;
}
