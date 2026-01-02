export declare enum BalanceAdjustmentType {
    ADD = "ADD",
    GET = "GET"
}
export declare class AdjustBalanceDto {
    amount: number;
    type: BalanceAdjustmentType;
    description?: string;
    referenceNumber?: string;
}
