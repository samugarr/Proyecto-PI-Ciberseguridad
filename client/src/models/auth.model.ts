// Cuerpos de petición y respuesta de /user, /salt y /login. Mismos nombres de campo que el servidor.
import { EncryptedPrivateKey, HybridCiphertext } from '../services/crypto.service';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  telephone: string;
  userType: string;
}

// Usuario de la sesión: los datos públicos más la cuenta, descifrada en el navegador tras el login
export interface SessionUser extends PublicUser {
  accountNumber: string;
}

export interface RegisterRequest extends EncryptedPrivateKey {
  name: string;
  email: string;
  telephone: string;
  kAuth: string;
  salt: string;
  publicKey: string;
  account: HybridCiphertext;
  accountLast4: string;
}

export interface SaltResponse {
  salt: string;
}

export interface TokenResponse {
  token: string;
}

export interface LoginResponse {
  user: PublicUser;
  token: string;    // JWT RS256 firmado por el servidor, caduca en 15 minutos
  keys: EncryptedPrivateKey & { publicKey: string };
  account: HybridCiphertext;
}
