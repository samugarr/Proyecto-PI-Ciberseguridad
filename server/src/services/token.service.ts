import jwt from "jsonwebtoken";
import { AuthContext } from "../model/auth.model";
import { User, UserType } from "../model/user.model";
import { SecretRepository } from "../repositories/secret.repository";

// Tokens de sesión. Tras un login correcto el servidor firma un JWT con su clave privada
// RSA (RS256). En cada petición protegida comprueba la firma con su clave pública, así que
// el cliente no puede fabricar ni modificar un token: ni cambiar de usuario ni de rol.
const TOKEN_ALGORITHM = "RS256";
const TOKEN_LIFETIME = "15m";
const TOKEN_ISSUER = "pi-server";
const KEY_PAIR_NAME = "jwt";

// Mientras la sesión está abierta el cliente renueva el token antes de que caduque, pero nunca
// más allá de este tiempo desde el login. Así un token robado no se puede renovar para siempre.
const MAX_SESSION_SECONDS = 8 * 60 * 60;

export class TokenService {

    private privateKey: string;
    private publicKey: string;

    constructor() {
        const keyPair = new SecretRepository().getOrCreateRsaKeyPair(KEY_PAIR_NAME);
        this.privateKey = keyPair.privateKey;
        this.publicKey = keyPair.publicKey;
    }

    // authTime se pasa al renovar para conservar la hora del login original
    public issueToken(user: User, authTime: number = nowInSeconds()): string {
        return jwt.sign({ role: user.userType, auth_time: authTime }, this.privateKey, {
            algorithm: TOKEN_ALGORITHM,
            expiresIn: TOKEN_LIFETIME,
            issuer: TOKEN_ISSUER,
            subject: String(user.id),
        });
    }

    public refreshToken(user: User, auth: AuthContext): string {
        if (nowInSeconds() - auth.authTime > MAX_SESSION_SECONDS) {
            throw new Error("La sesión ha superado su duración máxima");
        }
        return this.issueToken(user, auth.authTime);
    }

    // Lanza un error si la firma no es válida, el token ha caducado o no lo emitió este servidor.
    // El algoritmo se fija explícitamente para rechazar tokens con "alg: none" o HS256.
    public verifyToken(token: string): AuthContext {
        const payload = jwt.verify(token, this.publicKey, {
            algorithms: [TOKEN_ALGORITHM],
            issuer: TOKEN_ISSUER,
        });
        if (typeof payload === "string" || !payload.sub || typeof payload["auth_time"] !== "number") {
            throw new Error("Token con formato no válido");
        }
        return {
            userId: Number(payload.sub),
            role: payload["role"] as UserType,
            authTime: payload["auth_time"],
        };
    }
}

function nowInSeconds(): number {
    return Math.floor(Date.now() / 1000);
}
