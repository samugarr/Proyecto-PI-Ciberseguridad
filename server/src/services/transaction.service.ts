import { NewTransactionData, Transaction } from "../model/transaction.model";
import { UserType } from "../model/user.model";
import { TransactionRepository } from "../repositories/json/transaction.repository";
import { UserService } from "./user.service";

export class TransactionService {

    private transactionRepository: TransactionRepository;
    private userService: UserService;

    constructor() {
        this.transactionRepository = new TransactionRepository();
        this.userService = new UserService();
    }

    // El administrador ve todas las transacciones; el resto solo las suyas (como emisor o receptor).
    // El rol se lee de la base de datos, no del token, por si ha cambiado desde el login.
    public getTransactions(userId: number): Transaction[] {
        const user = this.userService.getUserById(userId);
        if (!user) {
            return [];
        }
        if (user.userType === UserType.ADMIN) {
            return this.transactionRepository.getTransactions();
        }
        return this.transactionRepository.getTransactionsByAccount(user.accountNumber);
    }

    public createTransaction(senderId: number, data: NewTransactionData): Transaction {
        const sender = this.userService.getUserById(senderId);
        if (!sender) {
            throw new Error("Usuario emisor no encontrado");
        }

        const telephoneTo = String(data.telephoneTo ?? "").replace(/\s/g, "");
        const receiver = this.userService.getUserByTelephone(telephoneTo);
        if (!receiver) {
            throw new Error("No existe ningún usuario con ese teléfono");
        }
        if (receiver.id === sender.id) {
            throw new Error("No puedes enviarte dinero a tu propia cuenta");
        }

        // Cantidad positiva con como máximo 2 decimales (céntimos)
        const amount = Number(data.amount);
        if (!Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) !== amount * 100) {
            throw new Error("La cantidad debe ser un número positivo con como máximo 2 decimales");
        }

        const transactions = this.transactionRepository.getTransactions();
        const id = transactions.length > 0 ? transactions[transactions.length - 1].id + 1 : 1;

        // La transacción se construye con los datos del servidor, no con lo que mande el cliente
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
