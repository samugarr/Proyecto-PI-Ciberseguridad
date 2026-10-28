import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SessionUser, TokenResponse } from '../models/auth.model';
import { base64UrlToText } from './encoding';

// Estado de la sesión: usuario, token JWT y claves descifradas en el login.
// Todo vive solo en memoria: nada se guarda en localStorage ni sessionStorage, para que un
// script inyectado (XSS) no pueda leer el token ni las claves. Al recargar la página se pierde
// y hay que volver a iniciar sesión, porque sin la contraseña no se puede recuperar K_enc.

// El token dura 15 minutos; se pide uno nuevo un minuto antes de que caduque
const REFRESH_MARGIN_MS = 60_000;

export interface SessionKeys {
  kEnc: CryptoKey;         // AES-256-GCM, protege la clave privada en el servidor
  privateKey: CryptoKey;   // k_u, RSA-OAEP, no exportable
  publicKey: CryptoKey;    // K_u, RSA-OAEP
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private currentUser: SessionUser | null = null;
  private token: string | null = null;
  private keys: SessionKeys | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  start(user: SessionUser, token: string, keys: SessionKeys): void {
    this.currentUser = user;
    this.keys = keys;
    this.setToken(token);
  }

  get user(): SessionUser | null {
    return this.currentUser;
  }

  get userId(): number | null {
    return this.currentUser?.id ?? null;
  }

  // Solo hay sesión si están las tres cosas: sin claves no se puede descifrar nada
  // y sin token el servidor rechaza las peticiones.
  get loggedIn(): boolean {
    return this.currentUser !== null && this.token !== null && this.keys !== null;
  }

  getToken(): string | null {
    return this.token;
  }

  getKeys(): SessionKeys | null {
    return this.keys;
  }

  // Solo para mostrar u ocultar elementos de la interfaz. El servidor comprueba el rol por su cuenta.
  hasRole(...roles: string[]): boolean {
    return this.currentUser !== null && roles.includes(this.currentUser.userType);
  }

  logout(): void {
    this.cancelRefresh();
    this.currentUser = null;
    this.token = null;
    this.keys = null;
    this.router.navigate(['/login']);
  }

  private setToken(token: string): void {
    this.token = token;
    this.cancelRefresh();
    const delay = tokenExpiresAt(token) - Date.now() - REFRESH_MARGIN_MS;
    this.refreshTimer = setTimeout(() => this.refreshToken(), Math.max(delay, 0));
  }

  // Si el servidor no renueva (sesión de más de 8 horas, usuario borrado o sin conexión)
  // se cierra la sesión: el token actual va a caducar de todas formas.
  private async refreshToken(): Promise<void> {
    try {
      const { token } = await firstValueFrom(this.http.post<TokenResponse>('/api/token/refresh', {}));
      this.setToken(token);
    } catch {
      if (this.loggedIn) {
        this.logout();
      }
    }
  }

  private cancelRefresh(): void {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// Lee "exp" del propio token solo para saber cuándo renovarlo. No verifica la firma:
// eso lo hace el servidor en cada petición.
function tokenExpiresAt(token: string): number {
  const payload = JSON.parse(base64UrlToText(token.split('.')[1]));
  return payload.exp * 1000;
}
