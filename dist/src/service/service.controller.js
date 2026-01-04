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
exports.ServiceController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = __importDefault(require("express"));
const service_service_1 = require("./service.service");
const create_service_dto_1 = require("./dto/create-service.dto");
const update_service_dto_1 = require("./dto/update-service.dto");
const service_analytics_dto_1 = require("./dto/service-analytics.dto");
const swagger_1 = require("@nestjs/swagger");
let ServiceController = class ServiceController {
    serviceService;
    constructor(serviceService) {
        this.serviceService = serviceService;
    }
    findAll(page, limit, category, serviceType, search, isActive, sortBy, sortOrder) {
        return this.serviceService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            category,
            serviceType,
            search,
            isActive: isActive ? isActive === 'true' : undefined,
            sortBy,
            sortOrder,
        });
    }
    getQuickStats() {
        return this.serviceService.getQuickStats();
    }
    findOne(id) {
        return this.serviceService.findOne(id);
    }
    create(createServiceDto) {
        return this.serviceService.create(createServiceDto);
    }
    update(id, updateServiceDto) {
        return this.serviceService.update(id, updateServiceDto);
    }
    remove(id) {
        return this.serviceService.remove(id);
    }
    async exportServices(query, res) {
        const { data, filename, contentType } = await this.serviceService.exportServices(query);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        if (query.format === 'json') {
            res.send(data);
        }
        else {
            res.send(data);
        }
    }
    toggleServiceStatus(id) {
        return this.serviceService.toggleServiceStatus(id);
    }
};
exports.ServiceController = ServiceController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all services with filtering and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, enum: create_service_dto_1.ServiceCategory }),
    (0, swagger_1.ApiQuery)({ name: 'serviceType', required: false, enum: create_service_dto_1.ServiceType }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['name', 'price', 'category', 'createdAt'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('serviceType')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('isActive')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ServiceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('quick-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quick statistics for dashboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServiceController.prototype, "getQuickStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new service' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Service created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a service' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_service_dto_1.UpdateServiceDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a service' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Service deleted successfully' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot delete service used in bills',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export services data' }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false, enum: ['csv', 'excel', 'json'] }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_analytics_dto_1.ExportServicesQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "exportServices", null);
__decorate([
    (0, common_1.Put)(':id/toggle-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle service active status' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceController.prototype, "toggleServiceStatus", null);
exports.ServiceController = ServiceController = __decorate([
    (0, swagger_1.ApiTags)('services'),
    (0, common_1.Controller)('services'),
    __metadata("design:paramtypes", [service_service_1.ServiceService])
], ServiceController);
//# sourceMappingURL=service.controller.js.map