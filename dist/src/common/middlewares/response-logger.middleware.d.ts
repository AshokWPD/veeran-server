import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class ResponseLoggerMiddleware implements NestMiddleware {
    private static reset;
    private static green;
    private static cyan;
    private static yellow;
    private static red;
    private static gray;
    private colorForStatus;
    use(req: Request, res: Response, next: NextFunction): void;
}
