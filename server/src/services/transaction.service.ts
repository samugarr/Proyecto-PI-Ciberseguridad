import { NewTransactionData, Transaction, TransactionView } from "../model/transaction.model";
import { User, UserType } from "../model/user.model";
import { TransactionRepository } from "../repositories/json/transaction.repository";
import { toTransactionView } from "../mappers/transaction.mapper";
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
    public getTransactions(userId: number): TransactionView[] {
        const user = this.userService.getUserById(userId);
        if (!user) {
            return [];
        }
        const transactions = user.userType === UserType.ADMIN
            ? this.transactionRepository.getTransactions()
            : this.transactionRepository.getTransactionsByUser(userId);
        return this.toViews(transactions);
    }

    public createTransaction(senderId: number, data: NewTransactionData): TransactionView {
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
        const newTransaction: Transaction = {
            id: transactions.length > 0 ? transactions[transactions.length - 1].id + 1 : 1,
            senderId: sender.id,
            receiverId: receiver.id,
            description: data.description.trim(),
            amount: amount,
            date: new Date()
        };

        this.transactionRepository.createTransaction(newTransaction);
        return toTransactionView(newTransaction, sender, receiver);
    }

    // Se cargan los usuarios una sola vez para resolver emisor y receptor de cada transacción.
    // Si alguno ya no existe, la transacción no se muestra.
    private toViews(transactions: Transaction[]): TransactionView[] {
        const usersById = new Map<number, User>(this.userService.getUsers().map(user => [user.id, user]));
        return transactions.flatMap(transaction => {
            const sender = usersById.get(transaction.senderId);
            const receiver = usersById.get(transaction.receiverId);
            return sender && receiver ? [toTransactionView(transaction, sender, receiver)] : [];
        });
    }
}
