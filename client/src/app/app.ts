import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (s.loggedIn) {
      <nav class="topnav">
        <strong>🔐 ConsulTxProt</strong>
        <a routerLink="/transactions" routerLinkActive="on">Transacciones</a>
        <a routerLink="/new-transaction" routerLinkActive="on">Nueva</a>
        @if (s.hasRole('admin','operator')) { <a routerLink="/admin" routerLinkActive="on">Administración</a> }
        <span class="spacer"></span>
        <span class="who">{{ s.user!.name }} · {{ s.user!.userType }}</span>
        <button class="linklike" (click)="s.logout()">Salir</button>
      </nav>
    }
    <router-outlet />`,
})
export class App {
  constructor(public s: SessionService) {}
}
