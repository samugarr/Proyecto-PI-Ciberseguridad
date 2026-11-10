import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";
import { ReportService } from "../services/report.service";

// Rutas protegidas con requireAuth: req.auth siempre existe y contiene el usuario del token.
export class ReportController {
    private reportService: ReportService;

    constructor() {
        this.reportService = new ReportService();
    }

    // POST /report  { transactions }
    public async createReport(req: Request, res: Response) {

        const { transactions } = req.body ?? {};

        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({
                error: "La lista de transacciones es obligatoria"
            });
        }

        try {
            const report = await this.reportService.createReport(transactions, req.auth!.userId);

            return res.status(201).json(report);

        } catch (error: any) {
            return res.status(500).json({
                error: error.message
            });
        }
    }

    // GET /report/:reportId
    public getReport(req: Request, res: Response) {
        const reportId = Number(req.params.reportId);

        if (!Number.isInteger(reportId) || reportId < 0) {
            return res.status(400).json({ error: "Identificador de informe no válido" });
        }

        const transactions = this.reportService.getReport(reportId);
        return res.status(200).json(transactions);
    }
}
