"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeCustomer = sanitizeCustomer;
function sanitizeCustomer(customer) {
    const { password, verificationToken, resetPasswordToken, resetTokenExpiry, ...safeCustomer } = customer;
    return safeCustomer;
}
//# sourceMappingURL=customer.utils.js.map