import { Request, Response } from "express";
import { NewUserData } from "../model/user.model";
import { UserService } from "../services/user.service";
import { toPublicUser } from "../mappers/user.mapper";

const HEX = /^[0-9a-f]+$/i;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
const SALT_HEX_LENGTH = 32;      // 16 bytes
const K_AUTH_HEX_LENGTH = 64;    // 32 bytes
const IV_BASE64_LENGTH = 16;     // 12 bytes

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public async registerUser(req: Request, res: Response) {
        const error = validateNewUser(req.body);
        if (error) {
            return res.status(400).json({ error });
        }

        const data: NewUserData = {
            name: req.body.name.trim(),
            email: req.body.email.trim().toLowerCase(),
            telephone: String(req.body.telephone).replace(/\s/g, ""),
            kAuth: req.body.kAuth,
            salt: req.body.salt,
            publicKey: req.body.publicKey,
            encryptedPrivateKey: req.body.encryptedPrivateKey,
            privateKeyIv: req.body.privateKeyIv,
        };

        try {
            const user = await this.userService.createUser(data);
            return res.status(201).json(toPublicUser(user));
        } catch (error: any) {
            // 409 = Conflict: email o teléfono ya registrados
            return res.status(409).json({ error: error.message });
        }
    }
}

// Devuelve el primer error encontrado o null si el cuerpo es válido.
function validateNewUser(body: any): string | null {
    const required = ["name", "email", "telephone", "kAuth", "salt", "publicKey", "encryptedPrivateKey", "privateKeyIv"];
    const missing = required.filter(field => typeof body?.[field] !== "string" || body[field].trim() === "");
    if (missing.length > 0) {
        return "Faltan campos obligatorios: " + missing.join(", ");
    }
    if (!/^\d{9}$/.test(body.telephone.replace(/\s/g, ""))) {
        return "El teléfono debe tener 9 dígitos";
    }
    if (body.salt.length !== SALT_HEX_LENGTH || !HEX.test(body.salt)) {
        return "La sal debe ser de 16 bytes en hexadecimal";
    }
    if (body.kAuth.length !== K_AUTH_HEX_LENGTH || !HEX.test(body.kAuth)) {
        return "K_auth debe ser de 32 bytes en hexadecimal";
    }
    if (!BASE64.test(body.publicKey) || !BASE64.test(body.encryptedPrivateKey)) {
        return "Las claves deben ir en base64";
    }
    if (body.privateKeyIv.length !== IV_BASE64_LENGTH || !BASE64.test(body.privateKeyIv)) {
        return "El IV debe ser de 12 bytes en base64";
    }
    return null;
}
