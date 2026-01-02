import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ResponseLoggerMiddleware implements NestMiddleware {
  // ANSI color codes
  private static reset = '\x1b[0m';
  private static green = '\x1b[32m';
  private static cyan = '\x1b[36m';
  private static yellow = '\x1b[33m';
  private static red = '\x1b[31m';
  private static gray = '\x1b[90m';

  private colorForStatus(status: number): string {
    if (status >= 200 && status < 300) return ResponseLoggerMiddleware.green;
    if (status >= 300 && status < 400) return ResponseLoggerMiddleware.cyan;
    if (status >= 400 && status < 500) return ResponseLoggerMiddleware.yellow;
    // 5xx and others
    return ResponseLoggerMiddleware.red;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = process.hrtime.bigint();

    const onFinish = () => {
      const end = process.hrtime.bigint();
      const diffNs = end - start;
      // Convert to milliseconds with fractional part if desired
      const durationMs = Number(diffNs) / 1e6;
      const status = res.statusCode;
      const color = this.colorForStatus(status);
      const reset = ResponseLoggerMiddleware.reset;

      // Example format: [METHOD] PATH | STATUS | 123.456ms
      const message = `${method} ${originalUrl} | ${status} | ${durationMs.toFixed(2)}ms`;

      // Colored log
      console.log(`${color}${message}${reset}`);
    };

    res.on('finish', onFinish);
    // In case of error, ensure listener is removed to avoid leaks
    res.on('close', onFinish);

    next();
  }
}
