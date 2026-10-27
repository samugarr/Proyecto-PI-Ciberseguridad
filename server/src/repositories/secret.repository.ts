import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

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
        fs.mkdirSync(this.directory, { recursive: true });
        fs.writeFileSync(filePath, secret.toString("hex"), { mode: 0o600 });
        return secret;
    }
}
