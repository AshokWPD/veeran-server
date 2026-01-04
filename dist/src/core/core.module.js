"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./services/prisma.service");
const email_service_1 = require("./services/email.service");
const onesignal_service_1 = require("./services/onesignal.service");
const image_generator_service_1 = require("./services/image-generator.service");
const config_1 = require("@nestjs/config");
let CoreModule = class CoreModule {
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            prisma_service_1.PrismaService,
            email_service_1.EmailService,
            onesignal_service_1.OneSignalService,
            image_generator_service_1.ImageGeneratorService,
        ],
        exports: [
            prisma_service_1.PrismaService,
            email_service_1.EmailService,
            onesignal_service_1.OneSignalService,
            image_generator_service_1.ImageGeneratorService,
        ],
    })
], CoreModule);
//# sourceMappingURL=core.module.js.map