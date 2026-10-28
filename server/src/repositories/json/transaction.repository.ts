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

    getTransactions(): Transaction[] {
        return readJsonArray<Transaction>(this.filePath);
    }

    // Transacciones en las que el usuario es emisor o receptor
    getTransactionsByUser(userId: number): Transaction[] {
        return this.getTransactions().filter(transaction =>
            transaction.senderId === userId || transaction.receiverId === userId);
    }
}
