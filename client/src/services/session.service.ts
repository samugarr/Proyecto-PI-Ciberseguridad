import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PublicUser } from '../models/auth.model';

// Estado de la sesión: usuario, token JWT y claves descifradas en el login.
// Todo vive solo en memoria: nada se guarda en localStorage ni sessionStorage, para que un
// script inyectado (XSS) no pueda leer el token ni las claves. Al recargar la página se pierde
// y hay que volver a iniciar sesión, porque sin la contraseña no se puede recuperar K_enc.

export interface SessionKeys {
  kEnc: CryptoKey;         // AES-256-GCM, protege la clave privada en el servidor
  privateKey: CryptoKey;   // k_u, RSA-OAEP, no exportable
  publicKey: CryptoKey;    // K_u, RSA-OAEP
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private currentUser: PublicUser | null = null;
  private token: string | null = null;
  private keys: SessionKeys | null = null;

  constructor(private router: Router) {}

  start(user: PublicUser, token: string, keys: SessionKeys): void {
    this.currentUser = user;
    this.token = token;
    this.keys = keys;
  }

  get user(): PublicUser | null {
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
    this.currentUser = null;
    this.token = null;
    this.keys = null;
    this.router.navigate(['/login']);
  }
}
