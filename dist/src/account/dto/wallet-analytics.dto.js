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
exports.MoneyExchangeResponseDto = exports.MoneyExchangeCalculationDto = exports.CreateMoneyExchangeDto = exports.CommissionDistributionDto = exports.CommissionDistributionMethod = exports.CommissionType = exports.MoneyExchangeType = exports.FundTransferDto = exports.WalletAnalyticsResponseDto = exports.WalletAnalyticsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class WalletAnalyticsQueryDto {
    startDate;
    endDate;
}
exports.WalletAnalyticsQueryDto = WalletAnalyticsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WalletAnalyticsQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WalletAnalyticsQueryDto.prototype, "endDate", void 0);
class WalletAnalyticsResponseDto {
    totalBalance;
    totalWallets;
    activeWallets;
    highestBalance;
    balanceByType;
    recentTransactions;
    walletDistribution;
}
exports.WalletAnalyticsResponseDto = WalletAnalyticsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletAnalyticsResponseDto.prototype, "totalBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletAnalyticsResponseDto.prototype, "totalWallets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletAnalyticsResponseDto.prototype, "activeWallets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletAnalyticsResponseDto.prototype, "highestBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], WalletAnalyticsResponseDto.prototype, "balanceByType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], WalletAnalyticsResponseDto.prototype, "recentTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], WalletAnalyticsResponseDto.prototype, "walletDistribution", void 0);
class FundTransferDto {
    fromAccountId;
    toAccountId;
    amount;
    description;
    commission;
}
exports.FundTransferDto = FundTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FundTransferDto.prototype, "fromAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FundTransferDto.prototype, "toAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FundTransferDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FundTransferDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FundTransferDto.prototype, "commission", void 0);
var MoneyExchangeType;
(function (MoneyExchangeType) {
    MoneyExchangeType["BIOMETRIC_WITHDRAWAL"] = "BIOMETRIC_WITHDRAWAL";
    MoneyExchangeType["GPAY_TRANSFER"] = "GPAY_TRANSFER";
    MoneyExchangeType["CASH_TO_GPAY"] = "CASH_TO_GPAY";
    MoneyExchangeType["GPAY_TO_CASH"] = "GPAY_TO_CASH";
})(MoneyExchangeType || (exports.MoneyExchangeType = MoneyExchangeType = {}));
var CommissionType;
(function (CommissionType) {
    CommissionType["PERCENTAGE"] = "PERCENTAGE";
    CommissionType["FIXED"] = "FIXED";
})(CommissionType || (exports.CommissionType = CommissionType = {}));
var CommissionDistributionMethod;
(function (CommissionDistributionMethod) {
    CommissionDistributionMethod["DEDUCT_FROM_AMOUNT"] = "DEDUCT_FROM_AMOUNT";
    CommissionDistributionMethod["SEPARATE_CASH"] = "SEPARATE_CASH";
    CommissionDistributionMethod["SEPARATE_DIGITAL"] = "SEPARATE_DIGITAL";
    CommissionDistributionMethod["SPLIT"] = "SPLIT";
})(CommissionDistributionMethod || (exports.CommissionDistributionMethod = CommissionDistributionMethod = {}));
class CommissionDistributionDto {
    method;
    cashCommission;
    digitalCommission;
    digitalCommissionWalletId;
    cashCommissionWalletId;
}
exports.CommissionDistributionDto = CommissionDistributionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CommissionDistributionMethod }),
    (0, class_validator_1.IsEnum)(CommissionDistributionMethod),
    __metadata("design:type", String)
], CommissionDistributionDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CommissionDistributionDto.prototype, "cashCommission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CommissionDistributionDto.prototype, "digitalCommission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommissionDistributionDto.prototype, "digitalCommissionWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommissionDistributionDto.prototype, "cashCommissionWalletId", void 0);
class CreateMoneyExchangeDto {
    transactionType;
    principalAmount;
    commissionType;
    commissionValue;
    commissionDistribution;
    sourceAccountId;
    destinationAccountId;
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
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoneyExchangeDto.prototype, "sourceAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMoneyExchangeDto.prototype, "destinationAccountId", void 0);
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
}
exports.MoneyExchangeCalculationDto = MoneyExchangeCalculationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MoneyExchangeCalculationDto.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MoneyExchangeCalculationDto.prototype, "commission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MoneyExchangeCalculationDto.prototype, "customerAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MoneyExchangeCalculationDto.prototype, "totalDebit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MoneyExchangeCalculationDto.prototype, "netAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MoneyExchangeCalculationDto.prototype, "profit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MoneyExchangeCalculationDto.prototype, "cashCommission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MoneyExchangeCalculationDto.prototype, "digitalCommission", void 0);
class MoneyExchangeResponseDto {
    transaction;
    sourceTransaction;
    destinationTransaction;
    calculations;
    bill;
}
exports.MoneyExchangeResponseDto = MoneyExchangeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], MoneyExchangeResponseDto.prototype, "transaction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], MoneyExchangeResponseDto.prototype, "sourceTransaction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], MoneyExchangeResponseDto.prototype, "destinationTransaction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", MoneyExchangeCalculationDto)
], MoneyExchangeResponseDto.prototype, "calculations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], MoneyExchangeResponseDto.prototype, "bill", void 0);
//# sourceMappingURL=wallet-analytics.dto.js.map