"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ResponseLoggerMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
let ResponseLoggerMiddleware = class ResponseLoggerMiddleware {
    static { ResponseLoggerMiddleware_1 = this; }
    static reset = '\x1b[0m';
    static green = '\x1b[32m';
    static cyan = '\x1b[36m';
    static yellow = '\x1b[33m';
    static red = '\x1b[31m';
    static gray = '\x1b[90m';
    colorForStatus(status) {
        if (status >= 200 && status < 300)
            return ResponseLoggerMiddleware_1.green;
        if (status >= 300 && status < 400)
            return ResponseLoggerMiddleware_1.cyan;
        if (status >= 400 && status < 500)
            return ResponseLoggerMiddleware_1.yellow;
        return ResponseLoggerMiddleware_1.red;
    }
    use(req, res, next) {
        const { method, originalUrl } = req;
        const start = process.hrtime.bigint();
        const onFinish = () => {
            const end = process.hrtime.bigint();
            const diffNs = end - start;
            const durationMs = Number(diffNs) / 1e6;
            const status = res.statusCode;
            const color = this.colorForStatus(status);
            const reset = ResponseLoggerMiddleware_1.reset;
            const message = `${method} ${originalUrl} | ${status} | ${durationMs.toFixed(2)}ms`;
            console.log(`${color}${message}${reset}`);
        };
        res.on('finish', onFinish);
        res.on('close', onFinish);
        next();
    }
};
exports.ResponseLoggerMiddleware = ResponseLoggerMiddleware;
exports.ResponseLoggerMiddleware = ResponseLoggerMiddleware = ResponseLoggerMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], ResponseLoggerMiddleware);
//# sourceMappingURL=response-logger.middleware.js.map