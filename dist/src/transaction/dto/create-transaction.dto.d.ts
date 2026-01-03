export declare enum TransactionType {
    MONEY_EXCHANGE = "MONEY_EXCHANGE",
    SERVICE = "SERVICE",
    PRODUCT = "PRODUCT",
    SELF_TRANSFER = "SELF_TRANSFER",
    COMMISSION = "COMMISSION",
    PURCHASE = "PURCHASE"
}
export declare enum TransactionSubType {
    BIO_METRIC_WITHDRAWAL = "BIO_METRIC_WITHDRAWAL",
    GPAY_TRANSFER = "GPAY_TRANSFER",
    CASH_TO_GPAY = "CASH_TO_GPAY",
    GPAY_TO_CASH = "GPAY_TO_CASH",
    PRINTING = "PRINTING",
    ONLINE_SERVICE = "ONLINE_SERVICE",
    STATIONERY = "STATIONERY",
    LAMINATION = "LAMINATION",
    XEROX = "XEROX",
    BILL_PAYMENT = "BILL_PAYMENT"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    GPAY = "GPAY",
    WALLET = "WALLET",
    CARD = "CARD",
    PORTER = "PORTER"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare class CreateTransactionDto {
    accountId: string;
    amount: number;
    direction: TransactionDirection;
    type: TransactionType;
    subType?: TransactionSubType;
    description?: string;
    status?: TransactionStatus;
    referenceNumber?: string;
    relatedAccountId?: string;
    commission?: number;
    netAmount?: number;
    profit?: number;
    metadata?: Record<string, any>;
    customerPhone?: string;
    paymentMethod?: PaymentMethod;
    wallet?: string;
    billId?: string;
}
export declare class TransactionFilterDto {
    page?: number;
    limit?: number;
    accountId?: string;
    type?: string;
    subType?: string;
    direction?: string;
    status?: TransactionStatus;
    paymentMethod?: string;
    wallet?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare enum TransactionDirection {
    IN = "IN",
    OUT = "OUT"
}
export declare class CreateTransferDto {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
    commission?: number;
}
export declare class CreateMoneyExchangeDto {
    cashAccountId: string;
    digitalAccountId: string;
    amount: number;
    commission: number;
    description?: string;
    metadata?: Record<string, any>;
}
