import { Request, Response } from "express";
import { NewUserData } from "../model/user.model";
import { UserService } from "../services/user.service";
import { toPublicUser } from "../mappers/user.mapper";

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
const SALT_BASE64_LENGTH = 24;     // 16 bytes
const K_AUTH_BASE64_LENGTH = 44;   // 32 bytes
const IV_BASE64_LENGTH = 16;       // 12 bytes
const RSA_BASE64_LENGTH = 344;     // 256 bytes: salida de RSA-OAEP con módulo de 2048 bits

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
            account: {
                ciphertext: req.body.account.ciphertext,
                iv: req.body.account.iv,
                wrappedKey: req.body.account.wrappedKey,
            },
            accountLast4: req.body.accountLast4,
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
    if (body.salt.length !== SALT_BASE64_LENGTH || !BASE64.test(body.salt)) {
        return "La sal debe ser de 16 bytes en base64";
    }
    if (body.kAuth.length !== K_AUTH_BASE64_LENGTH || !BASE64.test(body.kAuth)) {
        return "K_auth debe ser de 32 bytes en base64";
    }
    if (!BASE64.test(body.publicKey) || !BASE64.test(body.encryptedPrivateKey)) {
        return "Las claves deben ir en base64";
    }
    if (body.privateKeyIv.length !== IV_BASE64_LENGTH || !BASE64.test(body.privateKeyIv)) {
        return "El IV debe ser de 12 bytes en base64";
    }
    return validateAccount(body.account, body.accountLast4);
}

// La cuenta llega cifrada: el servidor solo puede comprobar el formato, no el contenido.
function validateAccount(account: any, accountLast4: unknown): string | null {
    if (typeof account?.ciphertext !== "string" || !BASE64.test(account.ciphertext)) {
        return "La cuenta cifrada debe ir en base64";
    }
    if (typeof account.iv !== "string" || account.iv.length !== IV_BASE64_LENGTH || !BASE64.test(account.iv)) {
        return "El IV de la cuenta debe ser de 12 bytes en base64";
    }
    if (typeof account.wrappedKey !== "string" || account.wrappedKey.length !== RSA_BASE64_LENGTH || !BASE64.test(account.wrappedKey)) {
        return "La clave de la cuenta debe estar cifrada con RSA-OAEP 2048";
    }
    if (typeof accountLast4 !== "string" || !/^\d{4}$/.test(accountLast4)) {
        return "Faltan los 4 últimos dígitos de la cuenta";
    }
    return null;
}
