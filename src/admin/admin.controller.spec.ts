import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminCreateDto } from './dto/admin-create.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminUpdateDto } from './dto/admin-update.dto';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: Partial<AdminService>;

  beforeEach(async () => {
    adminService = {
      createAdmin: jest
        .fn()
        .mockResolvedValue({ id: 'admin1', email: 'admin@example.com' }),
      editAdmin: jest.fn().mockResolvedValue({ id: 'admin1', name: 'Updated' }),
      login: jest.fn().mockResolvedValue({ access_token: 'token' }),
      getMe: jest
        .fn()
        .mockResolvedValue({ id: 'admin1', email: 'admin@example.com' }),
      forgotPassword: jest.fn().mockResolvedValue({ message: 'email sent' }),
      resetPassword: jest
        .fn()
        .mockResolvedValue({ message: 'password updated' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: adminService }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAdmin', () => {
    it('should call adminService.createAdmin with DTO and return result', async () => {
      const dto: AdminCreateDto = {
        email: 'admin@example.com',
        password: '123456',
        name: 'Admin',
      };
      const result = await controller.createAdmin(dto);
      expect(adminService.createAdmin).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'admin1', email: 'admin@example.com' });
    });
  });

  describe('editAdmin', () => {
    it('should call adminService.editAdmin with user id and DTO and return result', async () => {
      const dto: AdminUpdateDto = { name: 'New Name' };
      const req = { user: { sub: 'admin1' } };
      const result = await controller.editAdmin(req as any, dto);
      expect(adminService.editAdmin).toHaveBeenCalledWith('admin1', dto);
      expect(result).toEqual({ id: 'admin1', name: 'Updated' });
    });
  });

  describe('login', () => {
    it('should call adminService.login with DTO and return token', async () => {
      const dto: AdminLoginDto = {
        email: 'admin@example.com',
        password: '123456',
      };
      const result = await controller.login(dto);
      expect(adminService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ access_token: 'token' });
    });
  });

  describe('getMe', () => {
    it('should call adminService.getMe with user id and return profile', async () => {
      const req = { user: { sub: 'admin1' } };
      const result = await controller.getMe(req as any);
      expect(adminService.getMe).toHaveBeenCalledWith('admin1');
      expect(result).toEqual({ id: 'admin1', email: 'admin@example.com' });
    });
  });

  describe('forgotPassword', () => {
    it('should call adminService.forgotPassword with email and return message', async () => {
      const body = { email: 'admin@example.com' };
      const result = await controller.forgotPassword(body.email);
      expect(adminService.forgotPassword).toHaveBeenCalledWith(body.email);
      expect(result).toEqual({ message: 'email sent' });
    });
  });

  describe('resetPassword', () => {
    it('should call adminService.resetPassword with token and new password and return message', async () => {
      const body = { token: 'token123', newPassword: 'newpass123' };
      const result = await controller.resetPassword(body);
      expect(adminService.resetPassword).toHaveBeenCalledWith(
        body.token,
        body.newPassword,
      );
      expect(result).toEqual({ message: 'password updated' });
    });
  });
});
