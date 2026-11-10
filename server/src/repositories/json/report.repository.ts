import path from "path";
import { Report } from "../../model/report.model";
import { readJsonArray, writeJsonArray } from "./json-file";

export class ReportRepository {
    private filePath: string;

    constructor() {
        this.filePath = path.join(process.cwd(), "server", "data", "reports.json");
    }

    createReport(report: Report): Report {
        const reports = this.getReports();
        reports.push(report);
        writeJsonArray(this.filePath, reports);
        return report;
    }

    getReports(): Report[] {
        return readJsonArray<Report>(this.filePath);
    }

    getReportById(id: number): Report | null {
        const reports = this.getReports();
        return reports.find(report => report.id === id) || null;
    }
}
