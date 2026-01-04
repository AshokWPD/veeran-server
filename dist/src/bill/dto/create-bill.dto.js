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
exports.RefundBillDto = exports.UpdateBillStatusDto = exports.CreateBillDto = exports.BillItemDto = exports.BillStatus = exports.PaymentStatus = exports.PaymentMode = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var PaymentMode;
(function (PaymentMode) {
    PaymentMode["CASH"] = "CASH";
    PaymentMode["CARD"] = "CARD";
    PaymentMode["UPI"] = "UPI";
    PaymentMode["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMode["WALLET"] = "WALLET";
    PaymentMode["CREDIT"] = "CREDIT";
})(PaymentMode || (exports.PaymentMode = PaymentMode = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var BillStatus;
(function (BillStatus) {
    BillStatus["ACTIVE"] = "ACTIVE";
    BillStatus["VOID"] = "VOID";
    BillStatus["REFUNDED"] = "REFUNDED";
    BillStatus["DELETED"] = "DELETED";
})(BillStatus || (exports.BillStatus = BillStatus = {}));
class BillItemDto {
    serviceId;
    itemName;
    itemType;
    quantity;
    price;
    costPrice;
    commission;
    profit;
    metadata;
}
exports.BillItemDto = BillItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service ID (optional for non-service items)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BillItemDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BillItemDto.prototype, "itemName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item type (SERVICE, PRODUCT, etc.)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BillItemDto.prototype, "itemType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], BillItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BillItemDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cost price (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BillItemDto.prototype, "costPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission amount (auto-calculated if not provided)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BillItemDto.prototype, "commission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profit amount (auto-calculated if not provided)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BillItemDto.prototype, "profit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BillItemDto.prototype, "metadata", void 0);
class CreateBillDto {
    customerId;
    customerName;
    customerPhone;
    paymentMode;
    accountId;
    items;
    taxAmount = 0;
    discount = 0;
    notes;
    autoCalculateProfit = true;
}
exports.CreateBillDto = CreateBillDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID (optional if creating new customer)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBillDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name (required if creating new customer)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBillDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer phone (required if creating new customer)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBillDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PaymentMode, description: 'Payment mode' }),
    (0, class_validator_1.IsEnum)(PaymentMode),
    __metadata("design:type", String)
], CreateBillDto.prototype, "paymentMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account ID for receiving payment' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBillDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BillItemDto], description: 'Bill items' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BillItemDto),
    __metadata("design:type", Array)
], CreateBillDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tax amount', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBillDto.prototype, "taxAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount amount', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBillDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBillDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Auto calculate profit and commission', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBillDto.prototype, "autoCalculateProfit", void 0);
class UpdateBillStatusDto {
    paymentStatus;
    billStatus;
    notes;
}
exports.UpdateBillStatusDto = UpdateBillStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PaymentStatus, description: 'New payment status' }),
    (0, class_validator_1.IsEnum)(PaymentStatus),
    __metadata("design:type", String)
], UpdateBillStatusDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BillStatus, description: 'New bill status' }),
    (0, class_validator_1.IsEnum)(BillStatus),
    __metadata("design:type", String)
], UpdateBillStatusDto.prototype, "billStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes for status change' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBillStatusDto.prototype, "notes", void 0);
class RefundBillDto {
    refundAccountId;
    refundAmount;
    reason;
    notes;
}
exports.RefundBillDto = RefundBillDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account ID for refund' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefundBillDto.prototype, "refundAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Refund amount (full or partial)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RefundBillDto.prototype, "refundAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for refund' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefundBillDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefundBillDto.prototype, "notes", void 0);
//# sourceMappingURL=create-bill.dto.js.map