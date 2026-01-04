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
exports.DashboardResponseDto = exports.IncomeBreakdownDto = exports.RecentTransactionDto = exports.WalletBalanceDto = exports.ServiceStatsDto = exports.QuickStatsDto = exports.DashboardQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class DashboardQueryDto {
    startDate;
    endDate;
    accountId;
}
exports.DashboardQueryDto = DashboardQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DashboardQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DashboardQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DashboardQueryDto.prototype, "accountId", void 0);
class QuickStatsDto {
    label;
    value;
    percent;
    color;
    chart;
}
exports.QuickStatsDto = QuickStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], QuickStatsDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], QuickStatsDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], QuickStatsDto.prototype, "percent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], QuickStatsDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Number] }),
    __metadata("design:type", Array)
], QuickStatsDto.prototype, "chart", void 0);
class ServiceStatsDto {
    label;
    color;
    count;
}
exports.ServiceStatsDto = ServiceStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServiceStatsDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServiceStatsDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServiceStatsDto.prototype, "count", void 0);
class WalletBalanceDto {
    name;
    balance;
}
exports.WalletBalanceDto = WalletBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletBalanceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletBalanceDto.prototype, "balance", void 0);
class RecentTransactionDto {
    icon;
    name;
    id;
    amount;
    time;
    status;
    commission;
}
exports.RecentTransactionDto = RecentTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentTransactionDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentTransactionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentTransactionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RecentTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentTransactionDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentTransactionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RecentTransactionDto.prototype, "commission", void 0);
class IncomeBreakdownDto {
    series;
    labels;
    details;
}
exports.IncomeBreakdownDto = IncomeBreakdownDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Number] }),
    __metadata("design:type", Array)
], IncomeBreakdownDto.prototype, "series", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], IncomeBreakdownDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], IncomeBreakdownDto.prototype, "details", void 0);
class DashboardResponseDto {
    quickStats;
    monthlyRevenue;
    serviceStats;
    walletBalances;
    recentTransactions;
    serviceIncome;
}
exports.DashboardResponseDto = DashboardResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [QuickStatsDto] }),
    __metadata("design:type", Array)
], DashboardResponseDto.prototype, "quickStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], DashboardResponseDto.prototype, "monthlyRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ServiceStatsDto] }),
    __metadata("design:type", Array)
], DashboardResponseDto.prototype, "serviceStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [WalletBalanceDto] }),
    __metadata("design:type", Array)
], DashboardResponseDto.prototype, "walletBalances", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [RecentTransactionDto] }),
    __metadata("design:type", Array)
], DashboardResponseDto.prototype, "recentTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", IncomeBreakdownDto)
], DashboardResponseDto.prototype, "serviceIncome", void 0);
//# sourceMappingURL=dashboard.dto.js.map