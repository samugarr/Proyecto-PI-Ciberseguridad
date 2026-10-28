import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";

// Rutas protegidas con requireAuth: req.auth siempre existe y contiene el usuario del token.
export class TransactionController {
    private transactionService: TransactionService;

    constructor() {
        this.transactionService = new TransactionService();
    }

    // POST /transaction  { telephoneTo, amount, description }
    public createTransaction(req: Request, res: Response) {
        const { telephoneTo, amount, description } = req.body ?? {};
        if (!telephoneTo || amount === undefined || typeof description !== "string" || !description.trim()) {
            return res.status(400).json({
                error: "Teléfono de destino, cantidad y descripción son obligatorios"
            });
        }

        try {
            const transaction = this.transactionService.createTransaction(req.auth!.userId, { telephoneTo, amount, description });
            return res.status(201).json(transaction);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // GET /transactions
    public getTransactions(req: Request, res: Response) {
        const transactions = this.transactionService.getTransactions(req.auth!.userId);
        return res.status(200).json(transactions);
    }
}
