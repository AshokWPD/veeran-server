import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class AdminModule {}


// import { Module } from '@nestjs/common';
// import { AdminService } from './admin.service';
// import { AdminController } from './admin.controller';
// import { CoreModule } from '../core/core.module';
// import { JwtModule } from '@nestjs/jwt';

// @Module({
//   imports: [
//     CoreModule,
//     JwtModule.register({
//       secret: process.env.JWT_SECRET || 'secretKey',
//       signOptions: { expiresIn: '60m' },
//     }),
//   ],
//   controllers: [AdminController],
//   providers: [AdminService],
// })
// export class AdminModule {}
