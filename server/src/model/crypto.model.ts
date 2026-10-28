// Formatos de los datos cifrados que guarda el servidor. Todos los campos van en base64.
// El servidor los almacena y los devuelve, pero no tiene las claves para descifrarlos.

// E^{AES-256-GCM}_k(m): texto cifrado (incluye la etiqueta de autenticación) y su IV de 12 bytes
export interface AesGcmCiphertext {
    ciphertext: string;
    iv: string;
}

// Cifrado híbrido para un usuario u: m se cifra con una clave AES aleatoria k, y k se cifra
// con la clave pública del usuario: E^{RSA-OAEP}_{K_u}(k). Solo k_u puede recuperar k.
export interface HybridCiphertext extends AesGcmCiphertext {
    wrappedKey: string;
}
