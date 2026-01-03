import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { EmailService } from './services/email.service';
import { OneSignalService } from './services/onesignal.service';
import { ImageGeneratorService } from './services/image-generator.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    EmailService,
    OneSignalService,
    ImageGeneratorService,
  ],
  exports: [
    PrismaService,
    EmailService,
    OneSignalService,
    ImageGeneratorService,
  ],
})
export class CoreModule {}

// import { Global, Module } from '@nestjs/common';
// import { PrismaService } from './services/prisma.service';
// import { EmailService } from './services/email.service';

// @Global()
// @Module({
//   providers: [PrismaService, EmailService],
//   exports: [PrismaService, EmailService],
// })
// export class CoreModule {}

