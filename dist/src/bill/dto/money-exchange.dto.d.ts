export declare enum MoneyExchangeType {
    BIOMETRIC_WITHDRAWAL = "BIOMETRIC_WITHDRAWAL",
    CASH_TO_ONLINE = "CASH_TO_ONLINE",
    ONLINE_TO_CASH = "ONLINE_TO_CASH",
    ONLINE_TO_ONLINE = "ONLINE_TO_ONLINE",
    GPAY_TRANSFER = "GPAY_TRANSFER",
    MONEY_EXCHANGE = "MONEY_EXCHANGE"
}
export declare enum CommissionType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED"
}
export declare enum CommissionDistributionMethod {
    DEDUCT_FROM_AMOUNT = "DEDUCT_FROM_AMOUNT",
    SEPARATE_ONLINE = "SEPARATE_ONLINE",
    SEPARATE_CASH = "SEPARATE_CASH",
    SPLIT = "SPLIT"
}
export declare class CommissionDistributionDto {
    method: CommissionDistributionMethod;
    cashCommission?: number;
    digitalCommission?: number;
    digitalCommissionWalletId?: string;
    cashCommissionWalletId?: string;
    splitRatio?: number;
}
export declare class WalletSelectionDto {
    primaryWalletId: string;
    secondaryWalletId?: string;
    commissionWalletId?: string;
    cashWalletId?: string;
}
export declare class CreateMoneyExchangeDto {
    transactionType: MoneyExchangeType;
    principalAmount: number;
    commissionType: CommissionType;
    commissionValue: number;
    commissionDistribution: CommissionDistributionDto;
    walletSelection: WalletSelectionDto;
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
    commissionBreakdown: {
        method: CommissionDistributionMethod;
        description: string;
        customerReceives: number;
        weCollect: number;
        walletImpact: number;
    };
}
export declare class SimplifiedMoneyExchangeDto {
    transactionType: MoneyExchangeType;
    amount: number;
    commissionType: CommissionType;
    commissionValue: number;
    ourWalletId: string;
    cashWalletId?: string;
    customerWalletId?: string;
    commissionMethod: CommissionDistributionMethod;
    commissionWalletId?: string;
    cashCommissionWalletId?: string;
    splitCashAmount?: number;
    customerPhone?: string;
    customerName?: string;
    notes?: string;
    metadata?: any;
}
export declare class SimplifiedMoneyExchangeResponseDto {
    bill: any;
    calculations: MoneyExchangeCalculationDto;
    transactions: any[];
    walletBalances: {
        ourWallet: {
            id: string;
            name: string;
            newBalance: number;
        };
        cashWallet?: {
            id: string;
            name: string;
            newBalance: number;
        };
        customerWallet?: {
            id: string;
            name: string;
            newBalance: number;
        };
        commissionWallet?: {
            id: string;
            name: string;
            newBalance: number;
        };
        cashCommissionWallet?: {
            id: string;
            name: string;
            newBalance: number;
        };
    };
}
