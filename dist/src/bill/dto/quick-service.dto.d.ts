export declare class CartItemDto {
    id: string;
    name: string;
    price: number;
    quantity: number;
    code: string;
    onlinePaymentAmount?: number;
    requiresOnlinePayment?: boolean;
    accountAmount?: number;
    selectedAccountId?: string;
    selectedAccountName?: string;
    total?: number;
    onlinePaymentTotal?: number;
    accountAmountTotal?: number;
    onlinePaymentWalletId?: string;
    onlinePaymentWalletName?: string;
    serviceType?: string;
    category?: string;
    description?: string;
    hasOnlinePayment?: boolean;
}
export declare class PaymentSplitDto {
    method: string;
    amount: number;
    walletAccountId?: string;
}
export declare class CreateQuickServiceBillDto {
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    items: CartItemDto[];
    paymentMethod: string;
    paymentSplits: PaymentSplitDto[];
    accountId: string;
    taxAmount?: number;
    discount?: number;
    notes?: string;
    autoCalculateProfit?: boolean;
}
export declare class QuickServiceCalculationDto {
    subtotal: number;
    onlinePayments: number;
    accountSpend: number;
    total: number;
    commission: number;
    profit: number;
}
