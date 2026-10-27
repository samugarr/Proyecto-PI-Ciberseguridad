import { User } from "../../model/user.model";
import fs from "fs";
import path from "path";
import { Transaction } from "../../model/transaction.model";
import { UserRepository } from "./user.repository";

export class TransactionRepository {
    private filePath: string;
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.filePath = path.join(process.cwd(), "/server/data/transactions.json");
    }

    createTransaction(transaction: Transaction): Transaction {
        const data = fs.readFileSync(this.filePath, "utf-8");
        const transactions: Transaction[] = JSON.parse(data);      

        transactions.push(transaction);
        fs.writeFileSync(
            this.filePath,
            JSON.stringify(transactions, null, 2)
        );
        return transaction;
    }

    // Lista todas las transacciones
    getTransactions(): Transaction[] {
        const data = fs.readFileSync(this.filePath, "utf-8");
        const transactions: Transaction[] = JSON.parse(data);
        return transactions;
    }

    
    // Lista transacciones filtrando por la cuenta del usuario
    getTransactionsByUserId(userId: number): Transaction[] {
        const data = fs.readFileSync(this.filePath, "utf-8");
        const transactions: Transaction[] = JSON.parse(data);
        const user = this.userRepository.getUserById(userId);
        if (!user) {
            return [];
        }
        return transactions.filter(transaction => transaction.accountFrom === user.accountNumber || transaction.accountTo === user.accountNumber);
    }
    // Lista transacciones filtrando por la cuenta del usuario
    getTransactionsByAccount(accountNumber: string): Transaction[] {
        const data = fs.readFileSync(this.filePath, "utf-8");
        const transactions: Transaction[] = JSON.parse(data);
        return transactions.filter(transaction => transaction.accountFrom === accountNumber || transaction.accountTo === accountNumber);
    }   
}