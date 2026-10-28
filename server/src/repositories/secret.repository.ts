import fs from "fs";
import path from "path";
import { generateKeyPairSync, randomBytes } from "crypto";

export interface PemKeyPair {
    privateKey: string;   // PKCS#8 en PEM
    publicKey: string;    // SPKI en PEM
}

// Secretos propios del servidor (claves que nunca salen de él). Se generan la primera vez
// y se guardan en server/secrets/, que está fuera del control de versiones.
export class SecretRepository {
    private directory: string;

    constructor() {
        this.directory = path.join(process.cwd(), "server", "secrets");
    }

    getOrCreate(name: string, sizeInBytes: number): Buffer {
        const filePath = path.join(this.directory, name);
        if (fs.existsSync(filePath)) {
            return Buffer.from(fs.readFileSync(filePath, "utf-8").trim(), "hex");
        }
        const secret = randomBytes(sizeInBytes);
        this.write(name, secret.toString("hex"));
        return secret;
    }

    // Par RSA-2048 del servidor. Se guarda como <name>-private.pem y <name>-public.pem.
    getOrCreateRsaKeyPair(name: string): PemKeyPair {
        const privatePath = path.join(this.directory, name + "-private.pem");
        const publicPath = path.join(this.directory, name + "-public.pem");
        if (fs.existsSync(privatePath) && fs.existsSync(publicPath)) {
            return {
                privateKey: fs.readFileSync(privatePath, "utf-8"),
                publicKey: fs.readFileSync(publicPath, "utf-8"),
            };
        }
        const keyPair = generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
        this.write(name + "-private.pem", keyPair.privateKey);
        this.write(name + "-public.pem", keyPair.publicKey);
        return keyPair;
    }

    private write(name: string, content: string): void {
        fs.mkdirSync(this.directory, { recursive: true });
        fs.writeFileSync(path.join(this.directory, name), content, { mode: 0o600 });
    }
}
