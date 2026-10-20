import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";

export class TransactionController {
    private transactionService: TransactionService;       
    
     constructor() {
        this.transactionService = new TransactionService();
    }

    public createTransaction(req: Request, res: Response) {
        const data = req.body;

        if (!data.emailFrom || !data.telephoneTo || data.amount === undefined || !data.description?.trim()) {
            return res.status(400).json({
                error: "Emisor, teléfono de destino, cantidad y descripción son obligatorios"
            });
        }

        try {
            const transaction = this.transactionService.createTransaction(data);
            return res.status(201).json(transaction);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    public getTransactions(req: Request, res: Response) {
        const transactions = this.transactionService.getTransactions();
        return res.status(200).json(transactions);
    }
 } 
