import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";

export class TransactionController {
    private transactionService: TransactionService;       
    
     constructor() {
        this.transactionService = new TransactionService();
    }

    public createTransaction(req: Request, res: Response) {
        const data = req.body;

        const transaction = this.transactionService.createTransaction(data);
        return res.status(201).json(transaction);
    }
 } 
