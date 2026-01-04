"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickServiceCalculationDto = exports.CreateQuickServiceBillDto = exports.PaymentSplitDto = exports.CartItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CartItemDto {
    id;
    name;
    price;
    quantity;
    code;
    onlinePaymentAmount;
    requiresOnlinePayment;
    accountAmount;
    selectedAccountId;
    selectedAccountName;
    total;
    onlinePaymentTotal;
    accountAmountTotal;
    onlinePaymentWalletId;
    onlinePaymentWalletName;
    serviceType;
    category;
    description;
    hasOnlinePayment;
}
exports.CartItemDto = CartItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item price' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CartItemDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CartItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Online payment amount (amount to deduct from wallet)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CartItemDto.prototype, "onlinePaymentAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether requires online payment' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CartItemDto.prototype, "requiresOnlinePayment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CartItemDto.prototype, "accountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Selected account ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "selectedAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Selected account name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "selectedAccountName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CartItemDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Online payment total (amount to deduct from wallet)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CartItemDto.prototype, "onlinePaymentTotal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account amount total' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CartItemDto.prototype, "accountAmountTotal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Online payment wallet ID (wallet to deduct from)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "onlinePaymentWalletId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Online payment wallet name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "onlinePaymentWalletName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Service type' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "serviceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has online payment capability' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CartItemDto.prototype, "hasOnlinePayment", void 0);
class PaymentSplitDto {
    method;
    amount;
    walletAccountId;
}
exports.PaymentSplitDto = PaymentSplitDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentSplitDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], PaymentSplitDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Wallet account ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PaymentSplitDto.prototype, "walletAccountId", void 0);
class CreateQuickServiceBillDto {
    customerId;
    customerName;
    customerPhone;
    items;
    paymentMethod;
    paymentSplits;
    accountId;
    taxAmount;
    discount;
    notes;
    autoCalculateProfit;
}
exports.CreateQuickServiceBillDto = CreateQuickServiceBillDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuickServiceBillDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuickServiceBillDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer phone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuickServiceBillDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CartItemDto], description: 'Bill items' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], CreateQuickServiceBillDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuickServiceBillDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PaymentSplitDto], description: 'Payment splits' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], CreateQuickServiceBillDto.prototype, "paymentSplits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuickServiceBillDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateQuickServiceBillDto.prototype, "taxAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateQuickServiceBillDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuickServiceBillDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Auto calculate profit' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuickServiceBillDto.prototype, "autoCalculateProfit", void 0);
class QuickServiceCalculationDto {
    subtotal;
    onlinePayments;
    accountSpend;
    total;
    commission;
    profit;
}
exports.QuickServiceCalculationDto = QuickServiceCalculationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subtotal (service prices only)' }),
    __metadata("design:type", Number)
], QuickServiceCalculationDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Online payments (amounts to deduct from wallets)' }),
    __metadata("design:type", Number)
], QuickServiceCalculationDto.prototype, "onlinePayments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account spend (for backward compatibility)' }),
    __metadata("design:type", Number)
], QuickServiceCalculationDto.prototype, "accountSpend", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount (subtotal + online payments)' }),
    __metadata("design:type", Number)
], QuickServiceCalculationDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission' }),
    __metadata("design:type", Number)
], QuickServiceCalculationDto.prototype, "commission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profit' }),
    __metadata("design:type", Number)
], QuickServiceCalculationDto.prototype, "profit", void 0);
//# sourceMappingURL=quick-service.dto.js.map