import { Injectable } from '@angular/core';

// Claves de la sesión actual. Solo viven en memoria: no se guardan en localStorage ni
// sessionStorage para que un script inyectado (XSS) no pueda leerlas de ahí.
// Al recargar la página se pierden y hay que volver a iniciar sesión.
@Injectable({ providedIn: 'root' })
export class KeyStoreService {
  private kEnc: CryptoKey | null = null;
  private privateKey: CryptoKey | null = null;
  private publicKey: CryptoKey | null = null;

  setSessionKeys(kEnc: CryptoKey, privateKey: CryptoKey, publicKey: CryptoKey): void {
    this.kEnc = kEnc;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  hasKeys(): boolean {
    return this.privateKey !== null;
  }

  getKEnc(): CryptoKey | null {
    return this.kEnc;
  }

  getPrivateKey(): CryptoKey | null {
    return this.privateKey;
  }

  getPublicKey(): CryptoKey | null {
    return this.publicKey;
  }

  clear(): void {
    this.kEnc = null;
    this.privateKey = null;
    this.publicKey = null;
  }
}
