import { Request, Response } from "express";
import { UserService } from "../services/user.service";


export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    // "async" + "await": createUser tarda (Argon2 es lento a propósito),
    // así que esperamos a que termine antes de responder.
    public async registerUser(req: Request, res: Response) {
        const data = req.body;

        if (!data.name || !data.email || !data.password || !data.telephone || !data.salt) {
            return res.status(400).json({
                error: "Nombre, email, contraseña, teléfono y sal son obligatorios"
            });
        }

        try {
            const user = await this.userService.createUser(data);

            // Nunca devolvemos el hash de la contraseña al cliente
            const { password, ...userWithoutPassword } = user;
            return res.status(201).json(userWithoutPassword);
        } catch (error: any) {
            // 409 = Conflict (por ejemplo, el email ya existe)
            return res.status(409).json({ error: error.message });
        }
    }
}
