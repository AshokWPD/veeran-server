import {
  Body,
  Controller,
  Post,
  Put,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminCreateDto } from './dto/admin-create.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminUpdateDto } from './dto/admin-update.dto';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create admin' })
  @ApiBody({ type: AdminCreateDto })
  createAdmin(@Body() dto: AdminCreateDto) {
    return this.adminService.createAdmin(dto);
  }

  @Put('edit')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit admin profile' })
  @ApiBody({ type: AdminUpdateDto })
  editAdmin(@Req() req, @Body() dto: AdminUpdateDto) {
    return this.adminService.editAdmin(req.user.sub, dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({ type: AdminLoginDto })
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get own admin profile' })
  getMe(@Req() req) {
    return this.adminService.getMe(req.user.sub);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Admin forgot password' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  forgotPassword(@Body('email') email: string) {
    return this.adminService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Admin reset password using token' })
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.adminService.resetPassword(body.token, body.newPassword);
  }
}
