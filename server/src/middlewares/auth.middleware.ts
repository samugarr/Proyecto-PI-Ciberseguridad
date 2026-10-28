import { NextFunction, Request, Response } from "express";
import { TokenService } from "../services/token.service";

const tokenService = new TokenService();

// Protege una ruta: exige "Authorization: Bearer <token>" con un JWT válido y deja en
// req.auth el usuario autenticado. Los controladores usan req.auth, nunca un id del cliente.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Sesión no iniciada" });
    }
    try {
        req.auth = tokenService.verifyToken(header.slice("Bearer ".length));
        next();
    } catch {
        return res.status(401).json({ error: "Sesión caducada o no válida" });
    }
}
