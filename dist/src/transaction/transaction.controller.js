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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = __importDefault(require("express"));
const transaction_service_1 = require("./transaction.service");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const swagger_1 = require("@nestjs/swagger");
let TransactionController = class TransactionController {
    transactionService;
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    findAllWithFilters(page, limit, accountId, type, subType, direction, status, paymentMethod, wallet, startDate, endDate, search, sortBy, sortOrder) {
        const filters = {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            accountId,
            type,
            subType,
            direction,
            status,
            paymentMethod,
            wallet,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            search,
            sortBy,
            sortOrder,
        };
        return this.transactionService.findAllWithFilters(filters);
    }
    getAnalytics(startDate, endDate, accountId, type) {
        return this.transactionService.getTransactionAnalytics({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            accountId,
            type,
        });
    }
    getUniqueWallets() {
        return this.transactionService.getUniqueWallets();
    }
    getSummaryByType(startDate, endDate) {
        return this.transactionService.getTransactionSummaryByType({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    getTransactionTypes() {
        return this.transactionService.getTransactionTypes();
    }
    async getTransactionTrends(period = 'daily', startDate, endDate, type) {
        return this.transactionService.getTransactionTrends({
            period,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            type,
        });
    }
    async getDashboardCards(startDate, endDate) {
        return this.transactionService.getDashboardCards(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async getTransactionDistribution(startDate, endDate, groupBy) {
        return this.transactionService.getTransactionDistribution(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, groupBy);
    }
    async getTransactionSummary(startDate, endDate) {
        return this.transactionService.getTransactionSummary(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async getTransactionStats(startDate, endDate, groupBy) {
        return this.transactionService.getTransactionStats({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            groupBy,
        });
    }
    async getWalletPerformance(startDate, endDate, walletIds) {
        const walletIdsArray = Array.isArray(walletIds)
            ? walletIds
            : walletIds
                ? [walletIds]
                : undefined;
        return this.transactionService.getWalletPerformance(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, walletIdsArray);
    }
    async getCommissionAnalysis(startDate, endDate, type) {
        return this.transactionService.getCommissionAnalysis(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, type);
    }
    async getRecentTransactions(limit) {
        return this.transactionService.getRecentTransactions(limit || 10);
    }
    async getTransactionComparison(period1Start, period1End, period2Start, period2End, type) {
        return this.transactionService.getTransactionComparison({
            period1Start: new Date(period1Start),
            period1End: new Date(period1End),
            period2Start: new Date(period2Start),
            period2End: new Date(period2End),
            type,
        });
    }
    async getTopPerformers(startDate, endDate, limit, type) {
        let limitNumber = 10;
        if (limit) {
            const parsed = parseInt(limit, 10);
            if (!isNaN(parsed) && parsed > 0) {
                limitNumber = parsed;
            }
        }
        return this.transactionService.getTopPerformers(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, limitNumber, type || 'all');
    }
    createMoneyExchange(createMoneyExchangeDto) {
        return this.transactionService.createMoneyExchange(createMoneyExchangeDto);
    }
    async downloadReceipt(id, res) {
        try {
            const receipt = await this.transactionService.downloadReceipt(id);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=receipt-${id}.pdf`);
            return res.send(receipt);
        }
        catch (error) {
            return res.status(404).json({
                message: error.message || 'Transaction not found',
                error: 'Not Found',
                statusCode: 404,
            });
        }
    }
    async findOne(id) {
        return this.transactionService.findOne(id);
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions with advanced filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'accountId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'subType', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'direction', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: create_transaction_dto_1.TransactionStatus }),
    (0, swagger_1.ApiQuery)({ name: 'paymentMethod', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'wallet', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: Date }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: Date }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('accountId')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('subType')),
    __param(5, (0, common_1.Query)('direction')),
    __param(6, (0, common_1.Query)('status')),
    __param(7, (0, common_1.Query)('paymentMethod')),
    __param(8, (0, common_1.Query)('wallet')),
    __param(9, (0, common_1.Query)('startDate')),
    __param(10, (0, common_1.Query)('endDate')),
    __param(11, (0, common_1.Query)('search')),
    __param(12, (0, common_1.Query)('sortBy')),
    __param(13, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "findAllWithFilters", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction analytics for dashboard' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'accountId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('accountId')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('wallets'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all unique wallets for filtering' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "getUniqueWallets", null);
__decorate([
    (0, common_1.Get)('summary/type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction summary by type' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "getSummaryByType", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transaction types and subTypes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "getTransactionTypes", null);
__decorate([
    (0, common_1.Get)('trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction trends for charts' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'] }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionTrends", null);
__decorate([
    (0, common_1.Get)('dashboard-cards'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard cards data' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getDashboardCards", null);
__decorate([
    (0, common_1.Get)('distribution'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction distribution data' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'groupBy', required: false, enum: ['type', 'payment', 'wallet', 'status'] }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('groupBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionDistribution", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction summary' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionSummary", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction statistics' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'groupBy', required: false, enum: ['hour', 'day', 'week', 'month'] }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('groupBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionStats", null);
__decorate([
    (0, common_1.Get)('wallet-performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet performance data' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'walletIds', required: false, type: String, isArray: true }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('walletIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getWalletPerformance", null);
__decorate([
    (0, common_1.Get)('commission-analysis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get commission analysis' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getCommissionAnalysis", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent transactions' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getRecentTransactions", null);
__decorate([
    (0, common_1.Get)('comparison'),
    (0, swagger_1.ApiOperation)({ summary: 'Compare transactions between two periods' }),
    (0, swagger_1.ApiQuery)({ name: 'period1Start', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'period1End', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'period2Start', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'period2End', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String }),
    __param(0, (0, common_1.Query)('period1Start')),
    __param(1, (0, common_1.Query)('period1End')),
    __param(2, (0, common_1.Query)('period2Start')),
    __param(3, (0, common_1.Query)('period2End')),
    __param(4, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionComparison", null);
__decorate([
    (0, common_1.Get)('top-performers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top performing services/products' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['service', 'product', 'all'] }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTopPerformers", null);
__decorate([
    (0, common_1.Post)('money-exchange'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create money exchange transaction (Cash to Digital or vice versa)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateMoneyExchangeDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "createMoneyExchange", null);
__decorate([
    (0, common_1.Get)(':id/receipt'),
    (0, swagger_1.ApiOperation)({ summary: 'Download transaction receipt' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "downloadReceipt", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findOne", null);
exports.TransactionController = TransactionController = __decorate([
    (0, swagger_1.ApiTags)('transactions'),
    (0, common_1.Controller)('transactions'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map