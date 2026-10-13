import { EncryptionService } from "../services/encryption.service";
import { LoginService } from "../services/login.service";
import { Request, Response } from "express";

export class LoginController {

    private loginService: LoginService;
    private encryptionService: EncryptionService

    constructor() {
        this.loginService = new LoginService();
        this.encryptionService = new EncryptionService();
    }

    public async login(req: Request, res: Response) {
        const { email, password } = req.body;
        return this.loginService.login(email, password)
            .then(() => {
                res.status(200).json({ message: "Inicio de sesión exitoso" });
            })
            .catch((error) => {
                res.status(401).json({ error: error.message });
            });
    }
}
