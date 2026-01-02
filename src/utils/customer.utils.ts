export function sanitizeCustomer(customer: any) {
  const {
    password,
    verificationToken,
    resetPasswordToken,
    resetTokenExpiry,
    ...safeCustomer
  } = customer;
  return safeCustomer;
}
