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
exports.AdjustBalanceDto = exports.BalanceAdjustmentType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var BalanceAdjustmentType;
(function (BalanceAdjustmentType) {
    BalanceAdjustmentType["ADD"] = "ADD";
    BalanceAdjustmentType["GET"] = "GET";
})(BalanceAdjustmentType || (exports.BalanceAdjustmentType = BalanceAdjustmentType = {}));
class AdjustBalanceDto {
    amount;
    type;
    description;
    referenceNumber;
}
exports.AdjustBalanceDto = AdjustBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount to adjust (positive for ADD, negative for GET)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01, { message: 'Amount must be greater than 0' }),
    __metadata("design:type", Number)
], AdjustBalanceDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BalanceAdjustmentType, description: 'Type of adjustment' }),
    (0, class_validator_1.IsEnum)(BalanceAdjustmentType),
    __metadata("design:type", String)
], AdjustBalanceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Description of the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustBalanceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Reference number for tracking' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustBalanceDto.prototype, "referenceNumber", void 0);
//# sourceMappingURL=adjust-balance.dto.js.map