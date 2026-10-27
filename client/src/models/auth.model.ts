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
  keys: EncryptedPrivateKey & { publicKey: string };
}
