export interface AdminPayload {
    sub: string;
    email: string;
    role: string;
    playerId?: string;
    iat?: number;
    exp?: number;
}
