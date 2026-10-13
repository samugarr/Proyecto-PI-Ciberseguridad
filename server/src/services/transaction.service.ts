import { Transaction } from "../model/transaction.model";
import { TransactionRepository } from "../repositories/json/transaction.repository";
import { UserService } from "./user.service";

export class TransactionService {

    private transactionRepository: TransactionRepository;
    private userService: UserService;

    constructor() {
        this.transactionRepository = new TransactionRepository();
        this.userService = new UserService();
    }
    
    public getTransactions(): Transaction[] {
        //obtener usuario logeado
        const user = this.userService.getUserByEmail("luciaaaa@gmail.com");
        if (user) {
            if (user?.userType === "admin") {
                return this.transactionRepository.getTransactions();
            } else {
                return this.transactionRepository.getTransactionsByAccount(user?.accountNumber);
            }
        }
        return [];
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