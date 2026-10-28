import { Request, Response } from "express";
import { LoginService } from "../services/login.service";
import { TokenService } from "../services/token.service";
import { toPublicUser } from "../mappers/user.mapper";

export class LoginController {

    private loginService: LoginService;
    private tokenService: TokenService;

    constructor() {
        this.loginService = new LoginService();
        this.tokenService = new TokenService();
    }

    // POST /login  { email, kAuth }  ->  { user, token, keys }
    public async login(req: Request, res: Response) {
        const email = normalizeEmail(req.body?.email);
        const kAuth = req.body?.kAuth;
        if (!email || typeof kAuth !== "string") {
            return res.status(400).json({ error: "Email y K_auth son obligatorios" });
        }

        try {
            const user = await this.loginService.login(email, kAuth);
            // El cliente necesita su clave privada cifrada para descifrarla con K_enc.
            // El servidor la entrega pero no puede usarla.
            return res.status(200).json({
                user: toPublicUser(user),
                token: this.tokenService.issueToken(user),
                keys: {
                    publicKey: user.publicKey,
                    encryptedPrivateKey: user.encryptedPrivateKey,
                    privateKeyIv: user.privateKeyIv,
                },
            });
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    }

    // POST /salt  { email }  ->  { salt }
    public getSalt(req: Request, res: Response) {
        const email = normalizeEmail(req.body?.email);
        if (!email) {
            return res.status(400).json({ error: "El email es obligatorio" });
        }
        return res.status(200).json({ salt: this.loginService.getSalt(email) });
    }
}

function normalizeEmail(value: unknown): string | null {
    return typeof value === "string" && value.trim() !== "" ? value.trim().toLowerCase() : null;
}
