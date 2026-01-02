import { Controller, Get, Res } from '@nestjs/common';
import { BackupService } from './backup.service';
import type { Response } from 'express';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('export')
  async exportJsonBackup(@Res() res: Response) {
    const data = await this.backupService.fullDataExport();
    res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  }
}
