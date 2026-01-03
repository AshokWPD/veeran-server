import { PrismaService } from '../core/services/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { FundTransferDto, WalletAnalyticsQueryDto } from './dto/wallet-analytics.dto';
import { AdjustBalanceDto, BalanceAdjustmentType } from './dto/adjust-balance.dto';
export declare class AccountService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(params: {
        page?: number;
        limit?: number;
        type?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        isActive?: boolean;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<{
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
    }>;
    create(data: CreateAccountDto): Promise<{
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
    }>;
    update(id: string, data: UpdateAccountDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    getWalletAnalytics(query: WalletAnalyticsQueryDto): Promise<{
        totalBalance: number;
        totalWallets: number;
        activeWallets: number;
        highestBalance: null;
        balanceByType: {};
        walletDistribution: never[];
        recentTransactions: never[];
        highestBalanceAmount?: undefined;
        error?: undefined;
    } | {
        totalBalance: number;
        totalWallets: number;
        activeWallets: number;
        highestBalance: string | null;
        highestBalanceAmount: number;
        balanceByType: Record<string, number>;
        walletDistribution: {
            type: string;
            count: number;
            percentage: number;
        }[];
        recentTransactions: {
            id: string;
            accountName: string;
            type: string;
            subType: string | null;
            amount: number;
            direction: string;
            description: string | null;
            createdAt: Date;
            relatedAccountName: string | undefined;
        }[];
        error?: undefined;
    } | {
        totalBalance: number;
        totalWallets: number;
        activeWallets: number;
        highestBalance: null;
        balanceByType: {};
        walletDistribution: never[];
        recentTransactions: never[];
        error: string;
        highestBalanceAmount?: undefined;
    }>;
    getActiveWallets(): Promise<{
        name: string;
        id: string;
        type: string;
        accountNumber: string | null;
        balance: number;
    }[]>;
    transferFunds(transferData: FundTransferDto): Promise<{
        outgoingTransaction: {
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
        };
        incomingTransaction: {
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
        };
        fromAccount: {
            newBalance: number;
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
        };
        toAccount: {
            newBalance: number;
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
        };
    }>;
    toggleAccountStatus(id: string): Promise<{
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
    }>;
    adjustBalance(id: string, adjustBalanceDto: AdjustBalanceDto): Promise<{
        account: {
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
        };
        transaction: {
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
        };
        previousBalance: number;
        newBalance: number;
        adjustmentType: BalanceAdjustmentType;
        adjustedAmount: number;
    }>;
}
