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
exports.AccountController = void 0;
const common_1 = require("@nestjs/common");
const account_service_1 = require("./account.service");
const create_account_dto_1 = require("./dto/create-account.dto");
const update_account_dto_1 = require("./dto/update-account.dto");
const wallet_analytics_dto_1 = require("./dto/wallet-analytics.dto");
const adjust_balance_dto_1 = require("./dto/adjust-balance.dto");
const swagger_1 = require("@nestjs/swagger");
let AccountController = class AccountController {
    accountService;
    constructor(accountService) {
        this.accountService = accountService;
    }
    findAll(page, limit, type, search, sortBy, sortOrder, isActive) {
        return this.accountService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            type,
            search,
            sortBy,
            sortOrder,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
        });
    }
    getWalletAnalytics(query) {
        return this.accountService.getWalletAnalytics(query);
    }
    getActiveWallets() {
        return this.accountService.getActiveWallets();
    }
    transferFunds(transferData) {
        return this.accountService.transferFunds(transferData);
    }
    toggleAccountStatus(id) {
        return this.accountService.toggleAccountStatus(id);
    }
    findOne(id) {
        return this.accountService.findOne(id);
    }
    create(createAccountDto) {
        return this.accountService.create(createAccountDto);
    }
    update(id, updateAccountDto) {
        return this.accountService.update(id, updateAccountDto);
    }
    remove(id) {
        return this.accountService.remove(id);
    }
    async adjustBalance(id, adjustBalanceDto) {
        return this.accountService.adjustBalance(id, adjustBalanceDto);
    }
    async addMoney(id, data) {
        const adjustBalanceDto = {
            amount: data.amount,
            type: adjust_balance_dto_1.BalanceAdjustmentType.ADD,
            description: data.description,
            referenceNumber: data.referenceNumber,
        };
        return this.accountService.adjustBalance(id, adjustBalanceDto);
    }
    async getMoney(id, data) {
        const adjustBalanceDto = {
            amount: data.amount,
            type: adjust_balance_dto_1.BalanceAdjustmentType.GET,
            description: data.description,
            referenceNumber: data.referenceNumber,
        };
        return this.accountService.adjustBalance(id, adjustBalanceDto);
    }
};
exports.AccountController = AccountController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all accounts with filtering and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['name', 'balance', 'type', 'createdAt'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated accounts' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __param(6, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('analytics/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet analytics summary' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wallet_analytics_dto_1.WalletAnalyticsQueryDto]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "getWalletAnalytics", null);
__decorate([
    (0, common_1.Get)('wallet/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active wallets for transfers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "getActiveWallets", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer funds between accounts' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Funds transferred successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wallet_analytics_dto_1.FundTransferDto]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "transferFunds", null);
__decorate([
    (0, common_1.Put)(':id/toggle-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle account active status' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "toggleAccountStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new account' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Account created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_account_dto_1.CreateAccountDto]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an account' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_account_dto_1.UpdateAccountDto]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an account' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Account deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/adjust-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Add or get money from wallet' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Balance adjusted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid amount or insufficient balance' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adjust_balance_dto_1.AdjustBalanceDto]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "adjustBalance", null);
__decorate([
    (0, common_1.Post)(':id/add-money'),
    (0, swagger_1.ApiOperation)({ summary: 'Add money to wallet' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Money added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "addMoney", null);
__decorate([
    (0, common_1.Post)(':id/get-money'),
    (0, swagger_1.ApiOperation)({ summary: 'Get money from wallet' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'Account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Money retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Insufficient balance' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getMoney", null);
exports.AccountController = AccountController = __decorate([
    (0, swagger_1.ApiTags)('accounts'),
    (0, common_1.Controller)('accounts'),
    __metadata("design:paramtypes", [account_service_1.AccountService])
], AccountController);
//# sourceMappingURL=account.controller.js.map