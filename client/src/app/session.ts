
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PublicUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class Session {

  private readonly storageKey = 'user';

  public user: PublicUser | null = null;

  constructor(private router: Router) {
    this.loadUser();
  }

  /**
   * Carga el usuario almacenado en sessionStorage.
   */
  loadUser(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    const stored = sessionStorage.getItem(this.storageKey);

    if (!stored) {
      this.user = null;
      return;
    }

    try {
      this.user = JSON.parse(stored) as PublicUser;
    } catch {
      this.clear();
    }
  }

  /**
   * Guarda el usuario en memoria y en sessionStorage.
   */
  setUser(user: PublicUser): void {
    this.user = user;

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(
        this.storageKey,
        JSON.stringify(user)
      );
    }
  }

  /**
   * Indica si existe una sesión iniciada.
   */
  get loggedIn(): boolean {
    return this.user !== null;
  }

  /**
   * Devuelve el identificador del usuario actual.
   */
  get userId(): number | null {
    return this.user?.id ?? null;
  }

  /**
   * Comprueba si el usuario tiene alguno de los roles indicados.
   */
  hasRole(...roles: string[]): boolean {
    return !!this.user?.role &&
      roles.includes(this.user.role);
  }

  /**
   * Elimina los datos de sesión.
   */
  clear(): void {
    this.user = null;

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Cierra la sesión y vuelve al login.
   */
  logout(): void {
    this.clear();
    this.router.navigate(['/login']);
  }

  /**
   * Comprueba si existe un usuario y redirige al login si no.
   */
  requireLogin(): boolean {
    if (!this.loggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
