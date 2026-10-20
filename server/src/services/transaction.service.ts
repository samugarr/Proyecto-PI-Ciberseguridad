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
      return this.transactionRepository.getTransactions();

        //obtener usuario logeado
      /*  const user = this.userService.getUserByEmail("luciaaaa@gmail.com");
        if (user) {
            if (user?.userType === "admin") {
                return this.transactionRepository.getTransactions();
            } else {
                return this.transactionRepository.getTransactionsByAccount(user?.accountNumber);
            }
        }*/
        return [];
    }

    public createTransaction (data: { emailFrom: string; telephoneTo: string; amount: number; description: string }): Transaction {
        const sender = this.userService.getUserByEmail(data.emailFrom);
        if (!sender) {
            throw new Error("Usuario emisor no encontrado");
        }

        const telephoneTo = String(data.telephoneTo ?? "").replace(/\s/g, "");
        const receiver = this.userService.getUserByTelephone(telephoneTo);
        if (!receiver) {
            throw new Error("No existe ningún usuario con ese teléfono");
        }
        if (receiver.accountNumber === sender.accountNumber) {
            throw new Error("No puedes enviarte dinero a tu propia cuenta");
        }

        // Cantidad positiva con como máximo 2 decimales (céntimos)
        const amount = Number(data.amount);
        if (!Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) !== amount * 100) {
            throw new Error("La cantidad debe ser un número positivo con como máximo 2 decimales");
        }

        let transactions = this.transactionRepository.getTransactions();
        const id = transactions.length > 0 ? transactions[transactions.length - 1].id + 1 : 1;

        // Construimos la transacción con los datos del servidor, no con lo que mande el cliente
        const newTransaction: Transaction = {
            id: id,
            accountFrom: sender.accountNumber,
            accountTo: receiver.accountNumber,
            telephoneFrom: String(sender.telephone),
            telephoneTo: String(receiver.telephone),
            description: data.description.trim(),
            amount: amount,
            date: new Date()
        };

        this.transactionRepository.createTransaction(newTransaction);
        return newTransaction;
    }
}