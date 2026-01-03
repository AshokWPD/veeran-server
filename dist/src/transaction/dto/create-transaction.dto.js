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
exports.CreateMoneyExchangeDto = exports.CreateTransferDto = exports.TransactionDirection = exports.TransactionFilterDto = exports.CreateTransactionDto = exports.TransactionStatus = exports.PaymentMethod = exports.TransactionSubType = exports.TransactionType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var TransactionType;
(function (TransactionType) {
    TransactionType["MONEY_EXCHANGE"] = "MONEY_EXCHANGE";
    TransactionType["SERVICE"] = "SERVICE";
    TransactionType["PRODUCT"] = "PRODUCT";
    TransactionType["SELF_TRANSFER"] = "SELF_TRANSFER";
    TransactionType["COMMISSION"] = "COMMISSION";
    TransactionType["PURCHASE"] = "PURCHASE";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionSubType;
(function (TransactionSubType) {
    TransactionSubType["BIO_METRIC_WITHDRAWAL"] = "BIO_METRIC_WITHDRAWAL";
    TransactionSubType["GPAY_TRANSFER"] = "GPAY_TRANSFER";
    TransactionSubType["CASH_TO_GPAY"] = "CASH_TO_GPAY";
    TransactionSubType["GPAY_TO_CASH"] = "GPAY_TO_CASH";
    TransactionSubType["PRINTING"] = "PRINTING";
    TransactionSubType["ONLINE_SERVICE"] = "ONLINE_SERVICE";
    TransactionSubType["STATIONERY"] = "STATIONERY";
    TransactionSubType["LAMINATION"] = "LAMINATION";
    TransactionSubType["XEROX"] = "XEROX";
    TransactionSubType["BILL_PAYMENT"] = "BILL_PAYMENT";
})(TransactionSubType || (exports.TransactionSubType = TransactionSubType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["GPAY"] = "GPAY";
    PaymentMethod["WALLET"] = "WALLET";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["PORTER"] = "PORTER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
class CreateTransactionDto {
    accountId;
    amount;
    direction;
    type;
    subType;
    description;
    status;
    referenceNumber;
    relatedAccountId;
    commission;
    netAmount;
    profit;
    metadata;
    customerPhone;
    paymentMethod;
    wallet;
    billId;
}
exports.CreateTransactionDto = CreateTransactionDto;
class TransactionFilterDto {
    page;
    limit;
    accountId;
    type;
    subType;
    direction;
    status;
    paymentMethod;
    wallet;
    startDate;
    endDate;
    search;
    sortBy;
    sortOrder;
}
exports.TransactionFilterDto = TransactionFilterDto;
var TransactionDirection;
(function (TransactionDirection) {
    TransactionDirection["IN"] = "IN";
    TransactionDirection["OUT"] = "OUT";
})(TransactionDirection || (exports.TransactionDirection = TransactionDirection = {}));
class CreateTransferDto {
    fromAccountId;
    toAccountId;
    amount;
    description;
    commission;
}
exports.CreateTransferDto = CreateTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'from-account-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "fromAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'to-account-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "toAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Transfer between wallets', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "commission", void 0);
class CreateMoneyExchangeDto {
    cashAccountId;
    digitalAccountId;
    amount;
    commission;
    description;
    metadata;
}
exports.CreateMoneyExchangeDto = CreateMoneyExchangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cash-account-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMoneyExchangeDto.prototype, "cashAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'gpay-account-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMoneyExchangeDto.prototype, "digitalAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateMoneyExchangeDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateMoneyExchangeDto.prototype, "commission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Customer gave cash for GPay transfer',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMoneyExchangeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            customerPhone: '9876543210',
            commissionType: 'DEDUCT_FROM_AMOUNT',
        },
        required: false,
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateMoneyExchangeDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-transaction.dto.js.map