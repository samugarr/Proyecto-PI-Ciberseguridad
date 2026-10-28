import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { PartyView, TransactionView } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './transaction-list.page.html',
  styleUrls: ['./transaction-list.page.css'],
})
export class TransactionListPage implements OnInit {
  loading = false;
  errorMessage = '';
  transactions: TransactionView[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public session: SessionService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.http
      .get<TransactionView[]>('/api/transactions')
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'No se han podido cargar las transacciones.';
          this.loading = false;
        },
      });
  }

  isIncoming(transaction: TransactionView): boolean {
    return transaction.receiver.id === this.session.userId;
  }

  isOutgoing(transaction: TransactionView): boolean {
    return transaction.sender.id === this.session.userId;
  }

  // La otra parte de la transacción. Null si el usuario no participa (el administrador ve todas).
  counterpart(transaction: TransactionView): PartyView | null {
    if (this.isIncoming(transaction)) {
      return transaction.sender;
    }
    if (this.isOutgoing(transaction)) {
      return transaction.receiver;
    }
    return null;
  }
}
