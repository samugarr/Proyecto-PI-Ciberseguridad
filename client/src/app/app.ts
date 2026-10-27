import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Session } from './session';

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
        <!--<a routerLink="/documents" routerLinkActive="on">Documentos</a>-->
        @if (s.hasRole('admin','operator')) { <a routerLink="/admin" routerLinkActive="on">Administración</a> }
        <span class="spacer"></span>
        <span class="who">{{ s.user!.name }} · {{ s.user!.role }}</span>
        <button class="linklike" (click)="logout()">Salir</button>
      </nav>
    }
    <router-outlet />`,
})
export class App {
  constructor(public s: Session, private router: Router) {}
  async logout() {
    try { await this.s.logout(); } catch {}
    this.router.navigate(['/login']);
  }
}
