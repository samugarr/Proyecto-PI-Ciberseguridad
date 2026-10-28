import { HybridCiphertext } from "./crypto.model";

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;            // Argon2id(K_auth) en formato PHC ($argon2id$...), incluye su propia sal
    salt: string;                // s: 16 bytes en base64. Es pública, el cliente la necesita para derivar K_auth y K_enc
    userType: UserType;
    account: HybridCiphertext;   // nº de cuenta cifrado en el navegador: E_{k_acc}(cuenta) y E_{K_u}(k_acc)
    accountLast4: string;        // 4 últimos dígitos en claro, solo para mostrar la cuenta enmascarada
    telephone: string;
    publicKey: string;           // K_u: clave pública RSA-OAEP 2048, SPKI en base64
    encryptedPrivateKey: string; // E_{K_enc}(k_u): clave privada PKCS#8 cifrada con AES-256-GCM, base64
    privateKeyIv: string;        // IV de 12 bytes usado en el cifrado de k_u, base64
}

// Datos que envía el cliente al registrarse. kAuth es K_auth en base64, nunca la contraseña.
export interface NewUserData {
    name: string;
    email: string;
    telephone: string;
    kAuth: string;
    salt: string;
    publicKey: string;
    encryptedPrivateKey: string;
    privateKeyIv: string;
    account: HybridCiphertext;
    accountLast4: string;
}

// Lo que se puede devolver al cliente sobre un usuario: sin hash ni material de claves.
export interface PublicUser {
    id: number;
    name: string;
    email: string;
    telephone: string;
    userType: UserType;
}

export enum UserType {
    ADMIN = "admin",
    CLIENT = "client",
    OPERATOR = "operator",
}
