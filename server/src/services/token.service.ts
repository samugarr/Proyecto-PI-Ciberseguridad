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

export class TokenService {

    private privateKey: string;
    private publicKey: string;

    constructor() {
        const keyPair = new SecretRepository().getOrCreateRsaKeyPair(KEY_PAIR_NAME);
        this.privateKey = keyPair.privateKey;
        this.publicKey = keyPair.publicKey;
    }

    public issueToken(user: User): string {
        return jwt.sign({ role: user.userType }, this.privateKey, {
            algorithm: TOKEN_ALGORITHM,
            expiresIn: TOKEN_LIFETIME,
            issuer: TOKEN_ISSUER,
            subject: String(user.id),
        });
    }

    // Lanza un error si la firma no es válida, el token ha caducado o no lo emitió este servidor.
    // El algoritmo se fija explícitamente para rechazar tokens con "alg: none" o HS256.
    public verifyToken(token: string): AuthContext {
        const payload = jwt.verify(token, this.publicKey, {
            algorithms: [TOKEN_ALGORITHM],
            issuer: TOKEN_ISSUER,
        });
        if (typeof payload === "string" || !payload.sub) {
            throw new Error("Token sin identificador de usuario");
        }
        return { userId: Number(payload.sub), role: payload["role"] as UserType };
    }
}
