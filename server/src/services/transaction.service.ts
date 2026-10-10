import { Transaction } from "../model/transaction.model";
import { TransactionRepository } from "../repositories/json/transaction.repository";

export class TransactionService {

    private transactionRepository: TransactionRepository;
    constructor() {
        this.transactionRepository = new TransactionRepository();
    }
    
    public createTransaction (data: any): Transaction {
        let transactions = this.transactionRepository.getTransactions();
        const id = transactions.length > 0 ? transactions[transactions.length - 1].id + 1 : 1;

        const newTransaction: Transaction = {
            id: id,
            ...data
        };

        this.transactionRepository.createTransaction(newTransaction);
        return newTransaction;
    }
}