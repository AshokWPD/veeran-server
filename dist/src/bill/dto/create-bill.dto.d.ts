export declare enum PaymentMode {
    CASH = "CASH",
    CARD = "CARD",
    UPI = "UPI",
    BANK_TRANSFER = "BANK_TRANSFER",
    WALLET = "WALLET",
    CREDIT = "CREDIT"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    REFUNDED = "REFUNDED",
    CANCELLED = "CANCELLED"
}
export declare enum BillStatus {
    ACTIVE = "ACTIVE",
    VOID = "VOID",
    REFUNDED = "REFUNDED",
    DELETED = "DELETED"
}
export declare class BillItemDto {
    serviceId?: string;
    itemName: string;
    itemType: string;
    quantity: number;
    price: number;
    costPrice?: number;
    commission?: number;
    profit?: number;
    metadata?: any;
}
export declare class CreateBillDto {
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    paymentMode: PaymentMode;
    accountId: string;
    items: BillItemDto[];
    taxAmount?: number;
    discount?: number;
    notes?: string;
    autoCalculateProfit?: boolean;
}
export declare class UpdateBillStatusDto {
    paymentStatus: PaymentStatus;
    billStatus: BillStatus;
    notes?: string;
}
export declare class RefundBillDto {
    refundAccountId: string;
    refundAmount: number;
    reason: string;
    notes?: string;
}
