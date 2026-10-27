// Genera un certificado X.509 autofirmado para HTTPS en local (localhost / 127.0.0.1).
// Se ejecuta automáticamente antes de arrancar el servidor (npm start) y Angular (npm start en client/).
// Solo crea un certificado nuevo si no existe, si está a punto de caducar o si la clave no corresponde al certificado.
//
//   node scripts/generate-certs.js          -> genera solo si hace falta
//   node scripts/generate-certs.js --force  -> fuerza uno nuevo
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const selfsigned = require("selfsigned");

const CERT_DIR = path.join(__dirname, "..", "server", "certs");
const KEY_PATH = path.join(CERT_DIR, "server.key");
const CERT_PATH = path.join(CERT_DIR, "server.crt");
const MIN_DAYS_LEFT = 7;

function needsNewCertificate() {
    if (!fs.existsSync(KEY_PATH) || !fs.existsSync(CERT_PATH)) {
        return "no existe";
    }
    try {
        const cert = new crypto.X509Certificate(fs.readFileSync(CERT_PATH));
        const key = crypto.createPrivateKey(fs.readFileSync(KEY_PATH));
        if (!cert.checkPrivateKey(key)) {
            return "la clave privada no corresponde al certificado";
        }
        const daysLeft = (new Date(cert.validTo).getTime() - Date.now()) / 86400000;
        if (daysLeft < MIN_DAYS_LEFT) {
            return "caduca en menos de " + MIN_DAYS_LEFT + " días";
        }
    } catch (error) {
        return "no se puede leer (" + error.message + ")";
    }
    return null;
}

async function main() {
    const force = process.argv.includes("--force");
    const reason = force ? "se ha forzado con --force" : needsNewCertificate();
    if (!reason) {
        console.log("[certs] Certificado HTTPS válido en server/certs/");
        return;
    }

    console.log("[certs] Generando certificado nuevo: " + reason);
    const notBefore = new Date();
    const notAfter = new Date(notBefore);
    notAfter.setFullYear(notAfter.getFullYear() + 1);

    const pems = await selfsigned.generate([{ name: "commonName", value: "localhost" }], {
        keySize: 2048,          // RSA-2048
        algorithm: "sha256",    // firma SHA-256 con RSA
        notBeforeDate: notBefore,
        notAfterDate: notAfter,
        extensions: [
            { name: "basicConstraints", cA: false },
            { name: "keyUsage", digitalSignature: true, keyEncipherment: true },
            { name: "extKeyUsage", serverAuth: true },
            {
                name: "subjectAltName",
                altNames: [
                    { type: 2, value: "localhost" },  // DNS
                    { type: 7, ip: "127.0.0.1" }      // IPv4
                ]
            }
        ]
    });

    fs.mkdirSync(CERT_DIR, { recursive: true });
    fs.writeFileSync(KEY_PATH, pems.private, { mode: 0o600 });
    fs.writeFileSync(CERT_PATH, pems.cert);

    console.log("[certs] Creados server/certs/server.key y server/certs/server.crt (válido hasta " + notAfter.toISOString().slice(0, 10) + ")");
    console.log("[certs] IMPORTANTE: es un certificado nuevo. Para que el navegador confíe en él ejecuta: npm run trust-cert");
}

main().catch((error) => {
    console.error("[certs] Error generando el certificado:", error);
    process.exit(1);
});
