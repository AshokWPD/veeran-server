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
exports.CreateServiceDto = exports.ServiceType = exports.ServiceCategory = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["BANKING"] = "BANKING";
    ServiceCategory["MONEY"] = "MONEY";
    ServiceCategory["DIGITAL"] = "DIGITAL";
    ServiceCategory["ONLINE"] = "ONLINE";
    ServiceCategory["PRINTING"] = "PRINTING";
    ServiceCategory["XEROX"] = "XEROX";
    ServiceCategory["LAMINATION"] = "LAMINATION";
    ServiceCategory["PRODUCT"] = "PRODUCT";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["FIXED_PRICE"] = "FIXED_PRICE";
    ServiceType["PERCENTAGE_COMMISSION"] = "PERCENTAGE_COMMISSION";
    ServiceType["VARIABLE_PRICE"] = "VARIABLE_PRICE";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
class CreateServiceDto {
    name;
    category;
    serviceType;
    defaultPrice;
    commissionRate;
    minAmount;
    maxAmount;
    hasOnlineCharge;
    onlineCharge;
    description;
    instructions;
    isActive;
}
exports.CreateServiceDto = CreateServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ServiceCategory, description: 'Service category' }),
    (0, class_validator_1.IsEnum)(ServiceCategory),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ServiceType, description: 'Service type' }),
    (0, class_validator_1.IsEnum)(ServiceType),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "serviceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default price for the service' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "defaultPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Commission rate for percentage services' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "commissionRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum amount for variable price services' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "minAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum amount for variable price services' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "maxAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether service has online charge' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateServiceDto.prototype, "hasOnlineCharge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Online charge amount - will be set during bill creation' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "onlineCharge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Service description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Service instructions' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "instructions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether service is active' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateServiceDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-service.dto.js.map