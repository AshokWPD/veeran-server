import { PrismaService } from '../core/services/prisma.service';
import { CreateMoneyExchangeDto, MoneyExchangeCalculationDto, SimplifiedMoneyExchangeDto, SimplifiedMoneyExchangeResponseDto } from '../bill/dto/money-exchange.dto';
import { Transaction, Bill } from '@prisma/client';
interface MoneyExchangeResult {
    transaction: Transaction;
    sourceTransaction: Transaction;
    destinationTransaction?: Transaction;
    commissionTransactions: Transaction[];
    calculations: MoneyExchangeCalculationDto;
    bill: Bill;
    walletBalances: any;
}
export declare class MoneyExchangeService {
    private prisma;
    constructor(prisma: PrismaService);
    createMoneyExchange(createMoneyExchangeDto: CreateMoneyExchangeDto): Promise<MoneyExchangeResult>;
    private serializeCommissionDistribution;
    private validateWallets;
    private validateWallet;
    private calculateMoneyExchangeAmounts;
    private validateBalances;
    private handleMainTransactions;
    private handleCommissionTransactions;
    private updateWalletBalances;
    private getServiceName;
    private getPaymentMode;
    private getCommissionDescription;
    private generateBillNumber;
    createSimplifiedMoneyExchange(dto: SimplifiedMoneyExchangeDto): Promise<SimplifiedMoneyExchangeResponseDto>;
    private getSecondaryWalletId;
    private transformToSimplifiedResponse;
}
export {};
