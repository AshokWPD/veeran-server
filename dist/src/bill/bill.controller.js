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
exports.BillController = void 0;
const common_1 = require("@nestjs/common");
const bill_service_1 = require("./bill.service");
const create_bill_dto_1 = require("./dto/create-bill.dto");
const quick_service_dto_1 = require("./dto/quick-service.dto");
const money_exchange_dto_1 = require("./dto/money-exchange.dto");
const swagger_1 = require("@nestjs/swagger");
let BillController = class BillController {
    billService;
    constructor(billService) {
        this.billService = billService;
    }
    findAll(page, limit, customerId, customerPhone, paymentMode, paymentStatus, billStatus, startDate, endDate, search, sortBy, sortOrder) {
        return this.billService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            customerId,
            customerPhone,
            paymentMode,
            paymentStatus,
            billStatus,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            search,
            sortBy,
            sortOrder,
        });
    }
    findOne(id) {
        return this.billService.findOne(id);
    }
    create(createBillDto) {
        return this.billService.create(createBillDto);
    }
    remove(id) {
        return this.billService.delete(id);
    }
    createQuickService(createQuickServiceBillDto) {
        return this.billService.createQuickServiceBill(createQuickServiceBillDto);
    }
    getTodaySummary() {
        return this.billService.getTodaySummary();
    }
    getRecentQuickServices(limit) {
        return this.billService.getRecentQuickServices(limit ? parseInt(limit, 10) : 10);
    }
    createSimplifiedMoneyExchange(simplifiedMoneyExchangeDto) {
        return this.billService.createSimplifiedMoneyExchange(simplifiedMoneyExchangeDto);
    }
};
exports.BillController = BillController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bills with filtering and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'customerPhone', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'paymentMode', required: false, enum: create_bill_dto_1.PaymentMode }),
    (0, swagger_1.ApiQuery)({ name: 'paymentStatus', required: false, enum: create_bill_dto_1.PaymentStatus }),
    (0, swagger_1.ApiQuery)({ name: 'billStatus', required: false, enum: create_bill_dto_1.BillStatus }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: Date }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: Date }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['createdAt', 'totalAmount', 'billNumber'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('customerId')),
    __param(3, (0, common_1.Query)('customerPhone')),
    __param(4, (0, common_1.Query)('paymentMode')),
    __param(5, (0, common_1.Query)('paymentStatus')),
    __param(6, (0, common_1.Query)('billStatus')),
    __param(7, (0, common_1.Query)('startDate')),
    __param(8, (0, common_1.Query)('endDate')),
    __param(9, (0, common_1.Query)('search')),
    __param(10, (0, common_1.Query)('sortBy')),
    __param(11, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bill by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new bill' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bill created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bill_dto_1.CreateBillDto]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a bill' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Bill deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete paid bill' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('quick-service'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a quick service bill' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Quick service bill created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quick_service_dto_1.CreateQuickServiceBillDto]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "createQuickService", null);
__decorate([
    (0, common_1.Get)('today/summary'),
    (0, swagger_1.ApiOperation)({ summary: "Get today's billing summary" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillController.prototype, "getTodaySummary", null);
__decorate([
    (0, common_1.Get)('recent/quick-services'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent quick service bills' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "getRecentQuickServices", null);
__decorate([
    (0, common_1.Post)('simplified-money-exchange'),
    (0, swagger_1.ApiOperation)({ summary: 'Create simplified money exchange transaction' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Simplified money exchange completed successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [money_exchange_dto_1.SimplifiedMoneyExchangeDto]),
    __metadata("design:returntype", void 0)
], BillController.prototype, "createSimplifiedMoneyExchange", null);
exports.BillController = BillController = __decorate([
    (0, swagger_1.ApiTags)('bills'),
    (0, common_1.Controller)('bills'),
    __metadata("design:paramtypes", [bill_service_1.BillService])
], BillController);
//# sourceMappingURL=bill.controller.js.map