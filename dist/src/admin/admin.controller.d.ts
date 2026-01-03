import { AdminService } from './admin.service';
import { AdminCreateDto } from './dto/admin-create.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminUpdateDto } from './dto/admin-update.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createAdmin(dto: AdminCreateDto): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        isSuperAdmin: boolean;
        playerId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    editAdmin(req: any, dto: AdminUpdateDto): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        isSuperAdmin: boolean;
        playerId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(dto: AdminLoginDto): Promise<{
        access_token: string;
        playerId: string | null;
    }>;
    getMe(req: any): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        isSuperAdmin: boolean;
        playerId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    updatePlayerId(req: any, playerId: string): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        isSuperAdmin: boolean;
        playerId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
