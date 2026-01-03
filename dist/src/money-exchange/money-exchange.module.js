"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoneyExchangeModule = void 0;
const common_1 = require("@nestjs/common");
const money_exchange_service_1 = require("./money-exchange.service");
const prisma_service_1 = require("../core/services/prisma.service");
let MoneyExchangeModule = class MoneyExchangeModule {
};
exports.MoneyExchangeModule = MoneyExchangeModule;
exports.MoneyExchangeModule = MoneyExchangeModule = __decorate([
    (0, common_1.Module)({
        providers: [money_exchange_service_1.MoneyExchangeService, prisma_service_1.PrismaService],
        exports: [money_exchange_service_1.MoneyExchangeService],
    })
], MoneyExchangeModule);
//# sourceMappingURL=money-exchange.module.js.map