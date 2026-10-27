export interface User {
    id: number;
    name: string;
    email: string;
    password: string;            // Argon2id(K_auth) en formato PHC ($argon2id$...), incluye su propia sal
    salt: string;                // s: 16 bytes en hex. Es pública, el cliente la necesita para derivar K_auth y K_enc
    userType: UserType;
    accountNumber: string;
    telephone: string;
    publicKey: string;           // K_u: clave pública RSA-OAEP 2048, SPKI en base64
    encryptedPrivateKey: string; // E_{K_enc}(k_u): clave privada PKCS#8 cifrada con AES-256-GCM, base64
    privateKeyIv: string;        // IV de 12 bytes usado en el cifrado de k_u, base64
}

// Datos que envía el cliente al registrarse. kAuth es K_auth en hex, nunca la contraseña.
export interface NewUserData {
    name: string;
    email: string;
    telephone: string;
    kAuth: string;
    salt: string;
    publicKey: string;
    encryptedPrivateKey: string;
    privateKeyIv: string;
}

// Lo que se puede devolver al cliente sobre un usuario: sin hash ni material de claves.
export interface PublicUser {
    id: number;
    name: string;
    email: string;
    telephone: string;
    accountNumber: string;
    userType: UserType;
}

export enum UserType {
    ADMIN = "admin",
    CLIENT = "client",
    OPERATOR = "operator",
}
