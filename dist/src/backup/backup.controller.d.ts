import { BackupService } from './backup.service';
import type { Response } from 'express';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    exportJsonBackup(res: Response): Promise<void>;
}
