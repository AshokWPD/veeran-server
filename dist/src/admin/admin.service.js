"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../core/services/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const node_crypto_1 = require("node:crypto");
let AdminService = class AdminService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async createAdmin(data) {
        const { email, password, name, playerId } = data;
        const exists = await this.prisma.admin.findUnique({ where: { email } });
        if (exists)
            throw new common_1.ConflictException('Admin email already exists');
        const hash = await bcrypt.hash(password, 10);
        const admin = await this.prisma.admin.create({
            data: {
                email,
                name,
                password: hash,
                playerId
            },
        });
        const { password: _, resetToken, resetTokenExpiry, ...rest } = admin;
        return rest;
    }
    async editAdmin(adminId, data) {
        const admin = await this.prisma.admin.update({
            where: { id: adminId },
            data,
        });
        const { password, resetToken, resetTokenExpiry, ...rest } = admin;
        return rest;
    }
    async login(loginDto) {
        const { email, password, playerId } = loginDto;
        const admin = await this.prisma.admin.findUnique({ where: { email } });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (playerId) {
            await this.prisma.admin.update({
                where: { id: admin.id },
                data: { playerId },
            });
        }
        const payload = {
            sub: admin.id,
            email: admin.email,
            role: 'admin',
            playerId: admin.playerId
        };
        return {
            access_token: this.jwtService.sign(payload),
            playerId: admin.playerId
        };
    }
    async getMe(adminId) {
        const admin = await this.prisma.admin.findUnique({
            where: { id: adminId },
        });
        if (!admin)
            throw new common_1.NotFoundException('Admin not found');
        const { password, resetToken, resetTokenExpiry, ...rest } = admin;
        return rest;
    }
    async forgotPassword(email) {
        const admin = await this.prisma.admin.findUnique({ where: { email } });
        if (!admin)
            throw new common_1.NotFoundException('Admin not found');
        const resetToken = (0, node_crypto_1.randomBytes)(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600 * 1000);
        await this.prisma.admin.update({
            where: { id: admin.id },
            data: { resetToken, resetTokenExpiry },
        });
        return { message: 'Password reset email sent' };
    }
    async resetPassword(token, newPassword) {
        const admin = await this.prisma.admin.findFirst({
            where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
        });
        if (!admin)
            throw new common_1.BadRequestException('Invalid or expired token');
        const hash = await bcrypt.hash(newPassword, 10);
        await this.prisma.admin.update({
            where: { id: admin.id },
            data: { password: hash, resetToken: null, resetTokenExpiry: null },
        });
        return { message: 'Password reset successful' };
    }
    async updatePlayerId(adminId, playerId) {
        const admin = await this.prisma.admin.update({
            where: { id: adminId },
            data: { playerId },
        });
        const { password, resetToken, resetTokenExpiry, ...rest } = admin;
        return rest;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AdminService);
//# sourceMappingURL=admin.service.js.map