
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Session } from '../../app/session';

@Component({
  selector: 'app-new-transaction',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-transaction.page.html',
  styleUrls: ['./new-transaction.page.css']})

export class NewTransactionPage implements OnInit {

  telephoneTo = '';
  amount: number | null = null;
  description = '';
  sending = false;
  account = '';

  constructor(private http: HttpClient, private router: Router, private session: Session) {}

  ngOnInit() {
    if (!this.session.requireLogin()) {
      return;
    }
    this.account = this.session.user?.accountNumber ?? '';
  }

  async createTransaction() {

    const telephoneTo = this.telephoneTo.replace(/\s/g, '');
    if (!/^\d+$/.test(telephoneTo)) {
      alert('El teléfono solo puede contener números');
      return;
    }
    if (telephoneTo === String(this.session.user?.telephone)) {
      alert('No puedes enviarte dinero a tu propia cuenta');
      return;
    }
    if (this.amount === null || !(this.amount > 0)) {
      alert('Introduce una cantidad mayor que 0');
      return;
    }
    if (!this.description.trim()) {
      alert('Introduce una descripción');
      return;
    }

    this.sending = true;
    try {
      // POST a /api/transaction -> el proxy lo redirige a http://localhost:3000/transaction
      const body = {
        emailFrom: this.session.user?.email,
        telephoneTo: telephoneTo,
        amount: Math.round(this.amount * 100) / 100,
        description: this.description
      };
      const response = await firstValueFrom(this.http.post('/api/transaction', body));
      console.log('Transacción creada:', response);
      alert('Transacción realizada correctamente');

      this.telephoneTo = '';
      this.amount = null;
      this.description = '';
      this.router.navigate(['/transactions']);

    } catch (error: any) {
      console.error('Error en la transacción:', error);
      alert(error.error?.error ?? 'Error al realizar la transacción');
    } finally {
      this.sending = false;
    }
  }
}
