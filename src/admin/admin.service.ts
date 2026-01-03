import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/services/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AdminCreateDto } from './dto/admin-create.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminUpdateDto } from './dto/admin-update.dto';
import { randomBytes } from 'node:crypto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createAdmin(data: AdminCreateDto) {
    const { email, password, name, playerId } = data;
    const exists = await this.prisma.admin.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Admin email already exists');
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

  async editAdmin(adminId: string, data: AdminUpdateDto) {
    const admin = await this.prisma.admin.update({
      where: { id: adminId },
      data,
    });
    const { password, resetToken, resetTokenExpiry, ...rest } = admin;
    return rest;
  }

  async login(loginDto: AdminLoginDto) {
    const { email, password, playerId } = loginDto;
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update playerId on login if provided
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

  async getMe(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    const { password, resetToken, resetTokenExpiry, ...rest } = admin;
    return rest;
  }

  async forgotPassword(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new NotFoundException('Admin not found');
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600 * 1000);
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { resetToken, resetTokenExpiry },
    });
    // TODO: Send email here; use resetToken in the link
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!admin) throw new BadRequestException('Invalid or expired token');
    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { password: hash, resetToken: null, resetTokenExpiry: null },
    });
    return { message: 'Password reset successful' };
  }

  // Optional: Add a dedicated method to update playerId
  async updatePlayerId(adminId: string, playerId: string) {
    const admin = await this.prisma.admin.update({
      where: { id: adminId },
      data: { playerId },
    });
    const { password, resetToken, resetTokenExpiry, ...rest } = admin;
    return rest;
  }
}