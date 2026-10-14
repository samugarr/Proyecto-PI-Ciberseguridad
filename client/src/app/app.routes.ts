import { Routes } from '@angular/router';
import { LoginPage } from '../pages/login/login.page';
import { TransactionListPage } from '../pages/transaction-list/transaction-list.page';

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
    path: 'transactions',
    component: TransactionListPage
  }
];
