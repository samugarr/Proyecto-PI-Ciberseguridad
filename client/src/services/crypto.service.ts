// Criptografía del cliente. Todo lo que depende de la contraseña ocurre aquí, en el navegador:
// el servidor solo recibe K_auth, la sal, la clave pública, la clave privada ya cifrada y los
// datos cifrados con cifrado híbrido.
import { argon2id } from 'hash-wasm';
import { base64ToBytes, bytesToBase64 } from './encoding';

const ARGON2_PARAMS = {
  parallelism: 1,
  iterations: 3,
  memorySize: 65536,   // KiB = 64 MiB
  hashLength: 64,      // K_auth (32 bytes) || K_enc (32 bytes)
};

const SALT_BYTES = 16;
const AES_GCM_IV_BYTES = 12;

const RSA_OAEP_PARAMS: RsaHashedKeyGenParams = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),   // 65537
  hash: 'SHA-256',
};

export interface DerivedKeys {
  kAuth: string;       // 32 bytes en base64. Se envía al servidor para registrarse e iniciar sesión
  kEnc: CryptoKey;     // AES-256-GCM, no exportable. Nunca sale del navegador
}

// Cifrado híbrido para un usuario: m cifrado con una clave AES aleatoria k, y k cifrada con K_u
export interface HybridCiphertext {
  ciphertext: string;   // E^{AES-256-GCM}_k(m), base64 (incluye la etiqueta de autenticación)
  iv: string;           // IV de 12 bytes, base64
  wrappedKey: string;   // E^{RSA-OAEP}_{K_u}(k), base64
}

export interface EncryptedPrivateKey {
  encryptedPrivateKey: string;   // E_{K_enc}(k_u), base64
  privateKeyIv: string;          // IV de 12 bytes, base64
}

// s: 16 bytes aleatorios en base64
export function generateSalt(): string {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
}

// Argon2id(contraseña, sal) = 64 bytes, que se dividen en dos claves independientes:
// K_auth = bytes 0-31 para autenticarse y K_enc = bytes 32-63 para cifrar la clave privada.
export async function deriveKeys(password: string, salt: string): Promise<DerivedKeys> {
  const result = await argon2id({
    password,
    salt: base64ToBytes(salt),
    ...ARGON2_PARAMS,
    outputType: 'binary',
  });

  const kEnc = await crypto.subtle.importKey(
    'raw', new Uint8Array(result.slice(32, 64)), { name: 'AES-GCM' }, false, ['wrapKey', 'unwrapKey']);

  return { kAuth: bytesToBase64(result.slice(0, 32)), kEnc };
}

// Par de claves del usuario: K_u (pública) y k_u (privada). Se genera exportable
// solo para poder enviar K_u y cifrar k_u; tras el login se reimporta como no exportable.
export function generateRsaKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(RSA_OAEP_PARAMS, true, ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']);
}

// K_u en formato SPKI y base64
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  return bytesToBase64(await crypto.subtle.exportKey('spki', publicKey));
}

export function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki', base64ToBytes(publicKeyBase64), RSA_OAEP_PARAMS, true, ['encrypt', 'wrapKey']);
}

// E^{AES-256-GCM}_{K_enc}(k_u): la clave privada en PKCS#8 cifrada con un IV aleatorio
export async function encryptPrivateKey(privateKey: CryptoKey, kEnc: CryptoKey): Promise<EncryptedPrivateKey> {
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTES));
  const wrapped = await crypto.subtle.wrapKey('pkcs8', privateKey, kEnc, { name: 'AES-GCM', iv });
  return { encryptedPrivateKey: bytesToBase64(wrapped), privateKeyIv: bytesToBase64(iv) };
}

// D^{AES-256-GCM}_{K_enc}(...) = k_u. GCM autentica el contenido: si la contraseña es otra
// o el servidor ha modificado los datos, falla con OperationError en vez de devolver basura.
export function decryptPrivateKey(encrypted: EncryptedPrivateKey, kEnc: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    'pkcs8',
    base64ToBytes(encrypted.encryptedPrivateKey),
    kEnc,
    { name: 'AES-GCM', iv: base64ToBytes(encrypted.privateKeyIv) },
    RSA_OAEP_PARAMS,
    false,
    ['decrypt', 'unwrapKey'],
  );
}

// Cifra un texto para un usuario. Cada llamada usa una clave AES-256-GCM nueva y aleatoria k,
// que solo existe en memoria: se cifra con la clave pública K_u y se descarta.
export async function encryptHybrid(plaintext: string, publicKey: CryptoKey): Promise<HybridCiphertext> {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
  const wrappedKey = await crypto.subtle.wrapKey('raw', key, publicKey, { name: 'RSA-OAEP' });
  return { ciphertext: bytesToBase64(ciphertext), iv: bytesToBase64(iv), wrappedKey: bytesToBase64(wrappedKey) };
}

// Primero D^{RSA-OAEP}_{k_u}(wrappedKey) = k y después D^{AES-256-GCM}_k(ciphertext) = m.
// Si el servidor ha modificado cualquiera de las partes, falla con OperationError.
export async function decryptHybrid(encrypted: HybridCiphertext, privateKey: CryptoKey): Promise<string> {
  const key = await crypto.subtle.unwrapKey(
    'raw', base64ToBytes(encrypted.wrappedKey), privateKey, { name: 'RSA-OAEP' },
    { name: 'AES-GCM' }, false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(encrypted.iv) }, key, base64ToBytes(encrypted.ciphertext));
  return new TextDecoder().decode(plaintext);
}
