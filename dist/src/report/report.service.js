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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../core/services/prisma.service");
let ReportService = class ReportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async financialSummary(startDate, endDate) {
        const incomeResults = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                direction: 'IN',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        const expenseResults = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                direction: 'OUT',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        const income = incomeResults._sum.amount || 0;
        const expenses = expenseResults._sum.amount || 0;
        const profit = income - expenses;
        return { income, expenses, profit };
    }
    async topServices(limit = 5) {
        const topServices = await this.prisma.billItem.groupBy({
            by: ['serviceId'],
            _count: { serviceId: true },
            orderBy: { _count: { serviceId: 'desc' } },
            take: limit,
            where: { serviceId: { not: null } },
        });
        return topServices;
    }
    async accountBalances() {
        return this.prisma.account.findMany({
            select: {
                id: true,
                name: true,
                type: true,
                balance: true,
            },
            orderBy: { name: 'asc' },
        });
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportService);
//# sourceMappingURL=report.service.js.map