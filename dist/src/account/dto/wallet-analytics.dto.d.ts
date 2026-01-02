export declare class WalletAnalyticsQueryDto {
    startDate?: string;
    endDate?: string;
}
export declare class WalletAnalyticsResponseDto {
    totalBalance: number;
    totalWallets: number;
    activeWallets: number;
    highestBalance: string;
    balanceByType: Record<string, number>;
    recentTransactions: any[];
    walletDistribution: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
}
export declare class FundTransferDto {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
    commission?: number;
}
export declare enum MoneyExchangeType {
    BIOMETRIC_WITHDRAWAL = "BIOMETRIC_WITHDRAWAL",
    GPAY_TRANSFER = "GPAY_TRANSFER",
    CASH_TO_GPAY = "CASH_TO_GPAY",
    GPAY_TO_CASH = "GPAY_TO_CASH"
}
export declare enum CommissionType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED"
}
export declare enum CommissionDistributionMethod {
    DEDUCT_FROM_AMOUNT = "DEDUCT_FROM_AMOUNT",
    SEPARATE_CASH = "SEPARATE_CASH",
    SEPARATE_DIGITAL = "SEPARATE_DIGITAL",
    SPLIT = "SPLIT"
}
export declare class CommissionDistributionDto {
    method: CommissionDistributionMethod;
    cashCommission?: number;
    digitalCommission?: number;
    digitalCommissionWalletId?: string;
    cashCommissionWalletId?: string;
}
export declare class CreateMoneyExchangeDto {
    transactionType: MoneyExchangeType;
    principalAmount: number;
    commissionType: CommissionType;
    commissionValue: number;
    commissionDistribution: CommissionDistributionDto;
    sourceAccountId: string;
    destinationAccountId?: string;
    customerPhone?: string;
    customerName?: string;
    notes?: string;
    metadata?: any;
}
export declare class MoneyExchangeCalculationDto {
    principalAmount: number;
    commission: number;
    customerAmount: number;
    totalDebit: number;
    netAmount: number;
    profit: number;
    cashCommission: number;
    digitalCommission: number;
}
export declare class MoneyExchangeResponseDto {
    transaction: any;
    sourceTransaction: any;
    destinationTransaction?: any;
    calculations: MoneyExchangeCalculationDto;
    bill: any;
}
