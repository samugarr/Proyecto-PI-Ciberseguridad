
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './transaction-list.page.html',
  styleUrls: ['./transaction-list.page.css']})

export class TransactionListPage {

  transactions: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('api/transactions')
      .subscribe({
        next: (transactions: any[]) => {
          this.transactions = transactions;
        }
      });
  }

}
