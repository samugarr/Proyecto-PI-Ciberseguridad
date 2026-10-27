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

  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId;
      if (typeof userId !== 'string' || !userId) {
        res.status(400).json({
          error: 'El parámetro userId es obligatorio'
        });
        return;
      }

      const transactions =
        await this.transactionService.getTransactions(parseInt(userId));

      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Error al obtener las transacciones'
      });
    }
  }
 } 
