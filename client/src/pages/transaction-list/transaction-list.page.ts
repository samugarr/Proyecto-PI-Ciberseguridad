
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transaction-list.page.html',
  styleUrls: ['./transaction-list.page.css']})

export class TransactionListPage {

  email = '';
  password = '';

  constructor(private http: HttpClient) {}



}
