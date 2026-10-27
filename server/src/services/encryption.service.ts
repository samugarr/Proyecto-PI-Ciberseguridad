import argon2 from "argon2";
import { createHmac, randomBytes } from "crypto";

// Operaciones criptográficas del servidor. El servidor nunca ve la contraseña ni K_enc:
// solo hashea K_auth y calcula sales falsas para emails que no existen.
export class EncryptionService {

    // Hash de un valor aleatorio que nadie conoce. Se usa para que un login con un email
    // inexistente tarde lo mismo que uno con contraseña incorrecta.
    private static dummyHash: Promise<string> | null = null;

    public hashPassword(kAuth: string): Promise<string> {
        return argon2.hash(kAuth);
    }

    public verifyPassword(hash: string, kAuth: string): Promise<boolean> {
        return argon2.verify(hash, kAuth);
    }

    public getDummyHash(): Promise<string> {
        if (!EncryptionService.dummyHash) {
            EncryptionService.dummyHash = argon2.hash(randomBytes(32).toString("hex"));
        }
        return EncryptionService.dummyHash;
    }

    // HMAC-SHA256(key, message) recortado a sizeInBytes y en hex.
    public hmacHex(key: Buffer, message: string, sizeInBytes: number): string {
        return createHmac("sha256", key).update(message).digest().subarray(0, sizeInBytes).toString("hex");
    }
}
