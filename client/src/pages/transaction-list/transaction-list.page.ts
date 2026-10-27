
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './transaction-list.page.html',
  styleUrls: ['./transaction-list.page.css']})

export class TransactionListPage implements OnInit {

  transactions: any[] = [];
  user: { id: number, name: string; email: string; accountNumber: string; telephone: string } | null = null;
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
    console.log('Usuario guardado:', this.user);

    if (this.user) {
      this.http.get<any[]>('api/transactions', {
        params: { userId: this.user.id }
      }).subscribe({
          next: (transactions: any[]) => {
            this.transactions = transactions;
          }
        });
    }
  }

}
