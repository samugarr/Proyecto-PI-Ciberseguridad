import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (s.loggedIn) {
      <header class="app-header">
        <div class="app-header__inner">
          <a class="brand" routerLink="/transactions" aria-label="Wizum, ir a movimientos">
            <img src="wizum-logo.png" alt="Wizum" width="91" height="30">
          </a>
          <nav class="app-nav" aria-label="Principal">
            <a routerLink="/transactions" routerLinkActive="is-active">Movimientos</a>
            <a routerLink="/new-transaction" routerLinkActive="is-active">Enviar dinero</a>
            @if (s.hasRole('admin','operator')) { <a routerLink="/admin" routerLinkActive="is-active">Administración</a> }
          </nav>
          <div class="account-menu">
            <div class="account-menu__who">
              <span class="account-menu__name">{{ s.user!.name }}</span>
              <span class="account-menu__role">{{ s.user!.userType === 'admin' ? 'Administrador' : 'Cliente' }}</span>
            </div>
            <button type="button" class="btn btn-quiet" (click)="s.logout()">Cerrar sesión</button>
          </div>
        </div>
      </header>
    }
    <router-outlet />`,
})
export class App {
  constructor(public s: SessionService) {}
}
