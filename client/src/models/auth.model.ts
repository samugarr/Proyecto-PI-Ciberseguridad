// Cuerpos de petición y respuesta de /user, /salt y /login. Mismos nombres de campo que el servidor.
import { EncryptedPrivateKey } from '../services/crypto.service';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  telephone: string;
  accountNumber: string;
  userType: string;
}

export interface RegisterRequest extends EncryptedPrivateKey {
  name: string;
  email: string;
  telephone: string;
  kAuth: string;
  salt: string;
  publicKey: string;
}

export interface SaltResponse {
  salt: string;
}

export interface LoginResponse {
  user: PublicUser;
  token: string;    // JWT RS256 firmado por el servidor, caduca en 15 minutos
  keys: EncryptedPrivateKey & { publicKey: string };
}
