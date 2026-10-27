
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Session } from '../../app/session';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './transaction-list.page.html',
  styleUrls: ['./transaction-list.page.css']})

export class TransactionListPage implements OnInit {
  loading = false;
  errorMessage = '';
    transactions: any[] = [];
    accountNumber = '';
    constructor(private http: HttpClient, private router: Router,   private cdr: ChangeDetectorRef, public session: Session
  ) {}

  ngOnInit(): void {
    if (!this.session.requireLogin()) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.http.get<any[]>('/api/transactions', {
      params: { userId: String(this.session.userId) }
    }).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
        this.accountNumber = this.session.user?.accountNumber ?? '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'No se han podido cargar las transacciones.';
        this.loading = false;
      }
    });
  }

}
