import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../core/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

(bcrypt.hash as jest.Mock).mockResolvedValue('mockedHash');
(bcrypt.compare as jest.Mock).mockResolvedValue(true);


describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockHashedPassword =
    '$2b$10$EixZaYVK1fsbw1Zfbx3OXe.PujELe2LF5Q6O5KybP06NbDPq8qNKm'; // hash for '123456'

  const mockAdmin = {
    id: 'admin1',
    email: 'admin@shop.com',
    password: mockHashedPassword,
    name: 'Admin User',
    resetToken: null,
    resetTokenExpiry: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: {
            admin: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake_jwt_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('createAdmin', () => {
    it('creates a new admin and returns data without sensitive info', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.admin.create as jest.Mock).mockResolvedValue(mockAdmin);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(mockHashedPassword);

      const result = await service.createAdmin({
        email: 'admin@shop.com',
        password: '123456',
        name: 'Admin User',
      });

      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@shop.com' },
      });
      expect(prisma.admin.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockAdmin.id,
        email: mockAdmin.email,
        name: mockAdmin.name,
        resetToken: undefined,
        resetTokenExpiry: undefined,
      });
    });

    it('throws ConflictException if admin email exists', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      await expect(
        service.createAdmin({
          email: 'admin@shop.com',
          password: '123456',
          name: 'Admin User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('editAdmin', () => {
    it('updates admin and returns without sensitive info', async () => {
      (prisma.admin.update as jest.Mock).mockResolvedValue(mockAdmin);
      const result = await service.editAdmin('admin1', {
        name: 'Updated Admin',
      });
      expect(prisma.admin.update).toHaveBeenCalledWith({
        where: { id: 'admin1' },
        data: { name: 'Updated Admin' },
      });
      expect(result).toEqual({
        id: mockAdmin.id,
        email: mockAdmin.email,
        name: mockAdmin.name,
        resetToken: undefined,
        resetTokenExpiry: undefined,
      });
    });
  });

  describe('login', () => {
    it('logs in admin and returns access token', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const loginDto = { email: 'admin@shop.com', password: '123456' };
      const result = await service.login(loginDto);
      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(result).toEqual({ access_token: 'fake_jwt_token' });
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: mockAdmin.id,
        email: mockAdmin.email,
        role: 'admin',
      });
    });

    it('throws UnauthorizedException on wrong email', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.login({ email: 'wrong@shop.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on wrong password', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      await expect(
        service.login({ email: 'admin@shop.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('returns admin profile without sensitive info', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      const result = await service.getMe('admin1');
      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin1' },
      });
      expect(result).toEqual({
        id: mockAdmin.id,
        email: mockAdmin.email,
        name: mockAdmin.name,
        resetToken: undefined,
        resetTokenExpiry: undefined,
      });
    });

    it('throws NotFoundException if admin not found', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getMe('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('generates reset token and updates admin', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.admin.update as jest.Mock).mockResolvedValue(mockAdmin);
      const result = await service.forgotPassword('admin@shop.com');
      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@shop.com' },
      });
      expect(prisma.admin.update).toHaveBeenCalledWith({
        where: { id: mockAdmin.id },
        data: {
          resetToken: expect.any(String),
          resetTokenExpiry: expect.any(Date),
        },
      });
      expect(result).toEqual({ message: 'Password reset email sent' });
    });

    it('throws NotFoundException if admin email not found', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.forgotPassword('notfound@shop.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetPassword', () => {
    it('resets password if token valid', async () => {
      (prisma.admin.findFirst as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.admin.update as jest.Mock).mockResolvedValue(mockAdmin);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(mockHashedPassword);
      const result = await service.resetPassword('validtoken', 'newPass123');
      expect(prisma.admin.findFirst).toHaveBeenCalledWith({
        where: {
          resetToken: 'validtoken',
          resetTokenExpiry: { gt: expect.any(Date) },
        },
      });
      expect(prisma.admin.update).toHaveBeenCalledWith({
        where: { id: mockAdmin.id },
        data: {
          password: mockHashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
      expect(result).toEqual({ message: 'Password reset successful' });
    });

    it('throws BadRequestException if token invalid or expired', async () => {
      (prisma.admin.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(
        service.resetPassword('badtoken', 'newPass123'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
