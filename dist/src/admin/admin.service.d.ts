import { PrismaService } from '../core/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AdminCreateDto } from './dto/admin-create.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminUpdateDto } from './dto/admin-update.dto';
export declare class AdminService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    createAdmin(data: AdminCreateDto): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        isSuperAdmin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    editAdmin(adminId: string, data: AdminUpdateDto): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        isSuperAdmin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: AdminLoginDto): Promise<{
        access_token: string;
    }>;
    getMe(adminId: string): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        isSuperAdmin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
