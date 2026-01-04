import { Transaction, Bill, Account } from '@prisma/client';
import { MoneyExchangeCalculationDto } from '../bill/dto/money-exchange.dto';
export interface TransactionWithAccount extends Transaction {
    account: Account;
    relatedAccount?: Account;
}
export interface BillWithItems extends Bill {
    items: any[];
}
export interface MoneyExchangeResult {
    transaction: TransactionWithAccount;
    sourceTransaction: TransactionWithAccount;
    destinationTransaction?: TransactionWithAccount;
    commissionTransactions: TransactionWithAccount[];
    calculations: MoneyExchangeCalculationDto;
    bill: BillWithItems;
    walletBalances: {
        primaryWallet: {
            id: string;
            newBalance: number;
        };
        secondaryWallet?: {
            id: string;
            newBalance: number;
        };
        commissionWallet?: {
            id: string;
            newBalance: number;
        };
    };
}
