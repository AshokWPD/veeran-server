export declare class EmailService {
    private transporter;
    constructor();
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendResetPasswordEmail(email: string, token: string): Promise<void>;
}
