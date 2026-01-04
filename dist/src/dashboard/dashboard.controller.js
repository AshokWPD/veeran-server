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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_dto_1 = require("./dto/dashboard.dto");
const swagger_1 = require("@nestjs/swagger");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getDashboard(query) {
        return this.dashboardService.getDashboardData(query);
    }
    getQuickStats(query) {
        return this.dashboardService.getQuickStats(query);
    }
    getMonthlyRevenue(query) {
        return this.dashboardService.getMonthlyRevenue(query);
    }
    getServiceStats(query) {
        return this.dashboardService.getServiceStats(query);
    }
    getWalletBalances() {
        return this.dashboardService.getWalletBalances();
    }
    getRecentTransactions(query) {
        return this.dashboardService.getRecentTransactions(query);
    }
    getIncomeBreakdown(query) {
        return this.dashboardService.getIncomeBreakdown(query);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get complete dashboard data' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'accountId', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('quick-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quick statistics for dashboard cards' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getQuickStats", null);
__decorate([
    (0, common_1.Get)('monthly-revenue'),
    (0, swagger_1.ApiOperation)({ summary: 'Get monthly revenue data for chart' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getMonthlyRevenue", null);
__decorate([
    (0, common_1.Get)('service-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service statistics' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getServiceStats", null);
__decorate([
    (0, common_1.Get)('wallet-balances'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all wallet balances' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getWalletBalances", null);
__decorate([
    (0, common_1.Get)('recent-transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent transactions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getRecentTransactions", null);
__decorate([
    (0, common_1.Get)('income-breakdown'),
    (0, swagger_1.ApiOperation)({ summary: 'Get income breakdown by service category' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getIncomeBreakdown", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map