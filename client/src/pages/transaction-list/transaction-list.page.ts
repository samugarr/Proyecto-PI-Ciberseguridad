
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  loading = false;
  errorMessage = '';
    transactions: any[] = [];
    user: { id:number, name: string; email: string; accountNumber: string; telephone: string } | null = null;
    constructor(private http: HttpClient, private router: Router,   private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    const stored = sessionStorage.getItem('user');

    if (!stored) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      this.user = JSON.parse(stored);
    } catch (error) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.user) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.get<any[]>('/api/transactions', {
      params: { userId: this.user.id }
    }).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'No se han podido cargar las transacciones.';
        this.loading = false;
      }
    });
  }

}
