"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const core_module_1 = require("./core/core.module");
const admin_module_1 = require("./admin/admin.module");
const service_module_1 = require("./service/service.module");
const bill_module_1 = require("./bill/bill.module");
const customer_module_1 = require("./customer/customer.module");
const account_module_1 = require("./account/account.module");
const transaction_module_1 = require("./transaction/transaction.module");
const report_module_1 = require("./report/report.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const money_exchange_module_1 = require("./money-exchange/money-exchange.module");
const response_logger_middleware_1 = require("./common/middlewares/response-logger.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(response_logger_middleware_1.ResponseLoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            core_module_1.CoreModule,
            admin_module_1.AdminModule,
            service_module_1.ServiceModule,
            bill_module_1.BillModule,
            customer_module_1.CustomerModule,
            account_module_1.AccountModule,
            transaction_module_1.TransactionModule,
            report_module_1.ReportModule,
            dashboard_module_1.DashboardModule,
            money_exchange_module_1.MoneyExchangeModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map