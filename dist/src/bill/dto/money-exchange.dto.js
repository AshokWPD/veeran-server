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
exports.SimplifiedMoneyExchangeResponseDto = exports.SimplifiedMoneyExchangeDto = exports.MoneyExchangeCalculationDto = exports.CreateMoneyExchangeDto = exports.WalletSelectionDto = exports.CommissionDistributionDto = exports.CommissionDistributionMethod = exports.CommissionType = exports.MoneyExchangeType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var MoneyExchangeType;
(function (MoneyExchangeType) {
    MoneyExchangeType["BIOMETRIC_WITHDRAWAL"] = "BIOMETRIC_WITHDRAWAL";
    MoneyExchangeType["CASH_TO_ONLINE"] = "CASH_TO_ONLINE";
    MoneyExchangeType["ONLINE_TO_CASH"] = "ONLINE_TO_CASH";
    MoneyExchangeType["ONLINE_TO_ONLINE"] = "ONLINE_TO_ONLINE";
    MoneyExchangeType["GPAY_TRANSFER"] = "GPAY_TRANSFER";
    MoneyExchangeType["MONEY_EXCHANGE"] = "MONEY_EXCHANGE";
})(MoneyExchangeType || (exports.MoneyExchangeType = MoneyExchangeType = {}));
var CommissionType;
(function (CommissionType) {
    CommissionType["PERCENTAGE"] = "PERCENTAGE";
    CommissionType["FIXED"] = "FIXED";
})(CommissionType || (exports.CommissionType = CommissionType = {}));
var CommissionDistributionMethod;
(function (CommissionDistributionMethod) {
    CommissionDistributionMethod["DEDUCT_FROM_AMOUNT"] = "DEDUCT_FROM_AMOUNT";
    CommissionDistributionMethod["SEPARATE_ONLINE"] = "SEPARATE_ONLINE";
    CommissionDistributionMethod["SEPARATE_CASH"] = "SEPARATE_CASH";
    CommissionDistributionMethod["SPLIT"] = "SPLIT";
})(CommissionDistributionMethod || (exports.CommissionDistributionMethod = CommissionDistributionMethod = {}));
class CommissionDistributionDto {
    method;
    cashCommission;
    digitalCommission;
    digitalCommissionWalletId;
    cashCommissionWalletId;
    splitRatio;
}
exports.CommissionDistributionDto = CommissionDistributionDto;
__decorate([
    (0, class_validator_1.IsEnum)(CommissionDistributionMethod),
    __metadata("design:type", String)
], CommissionDistributionDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CommissionDistributionDto.prototype, "cashCommission", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CommissionDistributionDto.prototype, "digitalCommission", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CommissionDistributionDto.prototype, "digitalCommissionWalletId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CommissionDistributionDto.prototype, "cashCommissionWalletId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CommissionDistributionDto.prototype, "splitRatio", void 0);
class WalletSelectionDto {
    primaryWalletId;
    secondaryWalletId;
    commissionWalletId;
    cashWalletId;
}
exports.WalletSelectionDto = WalletSelectionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WalletSelectionDto.prototype, "primaryWalletId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WalletSelectionDto.prototype, "secondaryWalletId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WalletSelectionDto.prototype, "commissionWalletId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WalletSelectionDto.prototype, "cashWalletId", void 0);
class CreateMoneyExchangeDto {
    transactionType;
    principalAmount;
    commissionType;
    commissionValue;
    commissionDistribution;
    walletSelection;
    customerPhone;
    customerName;
    notes;
    metadata;
}
exports.CreateMoneyExchangeDto = CreateMoneyExchangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: MoneyExchangeType }),
    (0, class_validator_1.IsEnum)(MoneyExchangeType),
    __metadata("design:type", String)
], CreateMoneyExchangeDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateMoneyExchangeDto.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CommissionType }),
    (0, class_validator_1.IsEnum)(CommissionType),
    __metadata("design:type", String)
], CreateMoneyExchangeDto.prototype, "commissionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMoneyExchangeDto.prototype, "commissionValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CommissionDistributionDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CommissionDistributionDto),
    __metadata("design:type", CommissionDistributionDto)
], CreateMoneyExchangeDto.prototype, "commissionDistribution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: WalletSelectionDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WalletSelectionDto),
    __metadata("design:type", WalletSelectionDto)
], CreateMoneyExchangeDto.prototype, "walletSelection", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoneyExchangeDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoneyExchangeDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoneyExchangeDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateMoneyExchangeDto.prototype, "metadata", void 0);
class MoneyExchangeCalculationDto {
    principalAmount;
    commission;
    customerAmount;
    totalDebit;
    netAmount;
    profit;
    cashCommission;
    digitalCommission;
    commissionBreakdown;
}
exports.MoneyExchangeCalculationDto = MoneyExchangeCalculationDto;
class SimplifiedMoneyExchangeDto {
    transactionType;
    amount;
    commissionType;
    commissionValue;
    ourWalletId;
    cashWalletId;
    customerWalletId;
    commissionMethod;
    commissionWalletId;
    cashCommissionWalletId;
    splitCashAmount;
    customerPhone;
    customerName;
    notes;
    metadata;
}
exports.SimplifiedMoneyExchangeDto = SimplifiedMoneyExchangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: MoneyExchangeType }),
    (0, class_validator_1.IsEnum)(MoneyExchangeType),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SimplifiedMoneyExchangeDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CommissionType }),
    (0, class_validator_1.IsEnum)(CommissionType),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "commissionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SimplifiedMoneyExchangeDto.prototype, "commissionValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "ourWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "cashWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "customerWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CommissionDistributionMethod }),
    (0, class_validator_1.IsEnum)(CommissionDistributionMethod),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "commissionMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "commissionWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "cashCommissionWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SimplifiedMoneyExchangeDto.prototype, "splitCashAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimplifiedMoneyExchangeDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SimplifiedMoneyExchangeDto.prototype, "metadata", void 0);
class SimplifiedMoneyExchangeResponseDto {
    bill;
    calculations;
    transactions;
    walletBalances;
}
exports.SimplifiedMoneyExchangeResponseDto = SimplifiedMoneyExchangeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], SimplifiedMoneyExchangeResponseDto.prototype, "bill", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", MoneyExchangeCalculationDto)
], SimplifiedMoneyExchangeResponseDto.prototype, "calculations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], SimplifiedMoneyExchangeResponseDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], SimplifiedMoneyExchangeResponseDto.prototype, "walletBalances", void 0);
//# sourceMappingURL=money-exchange.dto.js.map