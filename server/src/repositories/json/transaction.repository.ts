import path from "path";
import { Transaction } from "../../model/transaction.model";
import { readJsonArray, writeJsonArray } from "./json-file";

export class TransactionRepository {
    private filePath: string;

    constructor() {
        this.filePath = path.join(process.cwd(), "server", "data", "transactions.json");
    }

    createTransaction(transaction: Transaction): Transaction {
        const transactions = this.getTransactions();
        transactions.push(transaction);
        writeJsonArray(this.filePath, transactions);
        return transaction;
    }

    // Lista todas las transacciones
    getTransactions(): Transaction[] {
        return readJsonArray<Transaction>(this.filePath);
    }

    // Lista transacciones filtrando por la cuenta del usuario
    getTransactionsByAccount(accountNumber: string): Transaction[] {
        return this.getTransactions().filter(transaction =>
            transaction.accountFrom === accountNumber || transaction.accountTo === accountNumber);
    }
}
