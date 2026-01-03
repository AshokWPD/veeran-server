export declare enum ServiceCategory {
    BANKING = "BANKING",
    MONEY = "MONEY",
    DIGITAL = "DIGITAL",
    ONLINE = "ONLINE",
    PRINTING = "PRINTING",
    XEROX = "XEROX",
    LAMINATION = "LAMINATION",
    PRODUCT = "PRODUCT"
}
export declare enum ServiceType {
    FIXED_PRICE = "FIXED_PRICE",
    PERCENTAGE_COMMISSION = "PERCENTAGE_COMMISSION",
    VARIABLE_PRICE = "VARIABLE_PRICE"
}
export declare class CreateServiceDto {
    name: string;
    category: ServiceCategory;
    serviceType: ServiceType;
    defaultPrice: number;
    commissionRate?: number;
    minAmount?: number;
    maxAmount?: number;
    hasOnlineCharge?: boolean;
    onlineCharge?: number;
    description?: string;
    instructions?: string;
    isActive?: boolean;
}
