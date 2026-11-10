import { Transaction } from "../model/transaction.model";
import PDFDocument from "pdfkit";
import fs from "fs";
import { UserService } from "./user.service";

export class PdfGenerationService {
    
    private userService: UserService;
    constructor() {
        this.userService = new UserService();
    }

    generatePdf(transactions: Transaction[], outputPath: string): Promise<void> {
      return new Promise((resolve, reject) => {

      const doc = new PDFDocument({
        margin: 50
      });

      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // Título
      doc
        .fontSize(20)
        .text("Informe de transacciones", {
          align: "center"
        });

      doc.moveDown();

      // Fecha de generación
      doc
        .fontSize(10)
        .text(`Fecha de generación: ${new Date().toLocaleDateString()}`);

      doc.moveDown(2);

      // Recorrer las transacciones
      transactions.forEach((transaction, index) => {
        const user1 = this.userService.getUserById(transaction.senderId);
        const user2 = this.userService.getUserById(transaction.receiverId);
        doc
          .fontSize(14)
          .text(`Transacción ${index + 1}`);

        doc.moveDown(0.5);

        doc
          .fontSize(10)
          .text(`ID: ${transaction.id}`)
          .text(`Cuenta origen: ${user1?.accountLast4 ?? 'Desconocida'}`)
          .text(`Cuenta destino: ${user2?.accountLast4 ?? 'Desconocida'}`)
          .text(`Cantidad: ${transaction.amount} €`)
          .text(`Descripción: ${transaction.description}`)
          .text(`Fecha: ${transaction.date}`);

        doc.moveDown();

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown();
      });

      // Finalizar PDF
      doc.end();

      stream.on("finish", () => {
        resolve();
      });

      stream.on("error", (error) => {
        reject(error);
      });
    });
}
}