import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { EmailService } from './services/email.service';

@Global()
@Module({
  providers: [PrismaService, EmailService],
  exports: [PrismaService, EmailService],
})
export class CoreModule {}



// import { Global, Module } from '@nestjs/common';
// import { PrismaService } from './services/prisma.service';

// @Global()
// @Module({
//   providers: [PrismaService],
//   exports: [PrismaService],
// })
// export class CoreModule {}
