
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-new-report',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-report.page.html',
  styleUrls: ['./new-report.page.css']})

export class NewReportPage implements OnInit {

  telephoneTo = '';
  amount: number | null = null;
  description = '';
  sending = false;
  account = '';

  constructor(private http: HttpClient, private router: Router, private session: SessionService) {}

  ngOnInit() {
    this.account = this.session.user?.accountNumber ?? '';
  }

  async createReport() {
    this.sending = true;

    try {
      const body = {
        transactions: []
      };

      await firstValueFrom(
        this.http.post('/api/report', body)
      );

      alert('Informe generado correctamente');

    } catch (error: any) {
      alert(error.error?.error ?? 'Error al generar el informe');
      console.error(error);

    } finally {
      this.sending = false;
    }
  }
}
