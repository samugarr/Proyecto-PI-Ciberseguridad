import argon2 from "argon2";
import { createHmac, randomBytes } from "crypto";

// Operaciones criptográficas del servidor. El servidor nunca ve la contraseña ni K_enc:
// solo hashea K_auth y calcula sales falsas para emails que no existen.
export class EncryptionService {

    // Hash de un valor aleatorio que nadie conoce. Se usa para que un login con un email
    // inexistente tarde lo mismo que uno con contraseña incorrecta.
    private static dummyHash: Promise<string> | null = null;

    // Se hashean los 32 bytes de K_auth, no su texto en base64
    public hashPassword(kAuth: string): Promise<string> {
        return argon2.hash(Buffer.from(kAuth, "base64"));
    }

    public verifyPassword(hash: string, kAuth: string): Promise<boolean> {
        return argon2.verify(hash, Buffer.from(kAuth, "base64"));
    }

    public getDummyHash(): Promise<string> {
        if (!EncryptionService.dummyHash) {
            EncryptionService.dummyHash = argon2.hash(randomBytes(32));
        }
        return EncryptionService.dummyHash;
    }

    // HMAC-SHA256(key, message) recortado a sizeInBytes y en base64.
    public hmacBase64(key: Buffer, message: string, sizeInBytes: number): string {
        return createHmac("sha256", key).update(message).digest().subarray(0, sizeInBytes).toString("base64");
    }
}
