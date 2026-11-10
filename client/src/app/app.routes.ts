import { Routes } from '@angular/router';
import { LoginPage } from '../pages/login/login.page';
import { RegisterPage } from '../pages/register/register.page';
import { TransactionListPage } from '../pages/transaction-list/transaction-list.page';
import { NewTransactionPage } from '../pages/new-transaction/new-transaction.page';
import { authGuard } from '../guards/auth.guard';
import { NewReportPage } from '../pages/new-report/new-report.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'register',
    component: RegisterPage
  },
  {
    path: 'transactions',
    component: TransactionListPage,
    canActivate: [authGuard]
  },
  {
    path: 'new-transaction',
    component: NewTransactionPage,
    canActivate: [authGuard]
  },
  {
    path: 'new-report',
    component: NewReportPage,
    canActivate: [authGuard]
  }
];
