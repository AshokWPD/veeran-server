import { PrismaService } from '../core/services/prisma.service';
import { Bill, Prisma } from '@prisma/client';
import { CreateBillDto } from './dto/create-bill.dto';
import { CreateQuickServiceBillDto } from './dto/quick-service.dto';
import { SimplifiedMoneyExchangeDto, SimplifiedMoneyExchangeResponseDto } from './dto/money-exchange.dto';
import { MoneyExchangeService } from '../money-exchange/money-exchange.service';
export declare class BillService {
    private prisma;
    private moneyExchangeService;
    constructor(prisma: PrismaService, moneyExchangeService: MoneyExchangeService);
    generateBillNumber(): Promise<string>;
    findAll(params: {
        page?: number;
        limit?: number;
        customerId?: string;
        customerPhone?: string;
        paymentMode?: string;
        paymentStatus?: string;
        billStatus?: string;
        startDate?: Date;
        endDate?: Date;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: Bill[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Bill>;
    create(createBillDto: CreateBillDto): Promise<Bill>;
    private calculateBillItemsWithCommission;
    delete(id: string): Promise<Bill>;
    createQuickServiceBill(createQuickServiceBillDto: CreateQuickServiceBillDto): Promise<Bill>;
    private calculateQuickServiceItemsWithCommission;
    private calculateQuickServiceItemCommission;
    private calculateItemProfit;
    private calculateSplitCommission;
    private calculateSplitProfit;
    private getPrimaryPaymentMode;
    getTodaySummary(): Promise<{
        quickServiceCount: number;
        moneyExchangeCount: number;
        totalRevenue: number;
        totalProfit: number;
        totalCommission: number;
        date: string;
    }>;
    getRecentQuickServices(limit?: number): Promise<({
        customer: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            notes: string | null;
        } | null;
        items: ({
            service: {
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
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            metadata: Prisma.JsonValue | null;
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
        })[];
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
        splitPayments: Prisma.JsonValue | null;
        accountTransactions: Prisma.JsonValue | null;
        customerId: string | null;
    })[]>;
    createSimplifiedMoneyExchange(simplifiedMoneyExchangeDto: SimplifiedMoneyExchangeDto): Promise<SimplifiedMoneyExchangeResponseDto>;
}
