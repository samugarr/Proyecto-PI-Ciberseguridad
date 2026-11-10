import { PdfGenerationService } from "./pdf-generation.service";
import { Report } from "../model/report.model";
import { ReportRepository } from "../repositories/json/report.repository";
import path from "path";
import fs from 'fs';

export class ReportService {

  private pdfGenerationService: PdfGenerationService;
  private reportRepository: ReportRepository;
  public directorio = '';

  constructor() {
    this.pdfGenerationService = new PdfGenerationService();
    this.reportRepository = new ReportRepository();

    this.directorio = path.join("server", "data", "reports");

    if (!fs.existsSync(this.directorio)) {
        fs.mkdirSync(this.directorio, { recursive: true });
    }
  }

  async createReport(filter: any[], userId: number): Promise<Report> {
    //filtros
    //buscar transacciones con filtros
    //generar pdf
    const id = Date.now();

    const filename = `informe-transacciones-${id}.pdf`;

    const rutaFisica = path.join(process.cwd(), this.directorio, filename);

    // Ruta relativa que guardaremos en JSON
    const rutaRelativa = path.join(this.directorio, filename);

    await this.pdfGenerationService.generatePdf([], rutaFisica);

    const report: Report = {
      id: id,
      ownerId: userId,
      fileName: filename,
      path: rutaRelativa,
      createdAt: new Date().toISOString(),
      sharedWith: []
    };
    this.reportRepository.createReport(report);
    return report;
  }

  public getReport(reportId: number): Report | null {
    // Implementación para obtener un informe por su ID
    return this.reportRepository.getReportById(reportId);
  }
}

