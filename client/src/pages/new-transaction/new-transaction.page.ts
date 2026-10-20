
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-transaction.page.html',
  styleUrls: ['./new-transaction.page.css']})

export class TransactionListPage implements OnInit {

  user: { name: string; email: string; accountNumber: string; telephone: string } | null = null;
  telephoneTo = '';
  amount: number | null = null;
  description = '';
  sending = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // sessionStorage solo existe en el navegador (no durante el renderizado en servidor)
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    // El login guarda aquí los datos públicos del usuario
    const stored = sessionStorage.getItem('user');
    if (!stored) {
      this.router.navigate(['/login']);
      return;
    }
    this.user = JSON.parse(stored);
  }

  async createTransaction() {
    if (!this.user) {
      return;
    }

    const telephoneTo = this.telephoneTo.replace(/\s/g, '');
    if (!/^\d+$/.test(telephoneTo)) {
      alert('El teléfono solo puede contener números');
      return;
    }
    if (telephoneTo === String(this.user.telephone)) {
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
        emailFrom: this.user.email,
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

    } catch (error: any) {
      console.error('Error en la transacción:', error);
      alert(error.error?.error ?? 'Error al realizar la transacción');
    } finally {
      this.sending = false;
    }
  }
}
