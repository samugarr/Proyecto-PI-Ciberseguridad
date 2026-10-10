import { Request, Response } from "express";
import { UserService
 } from "../services/user.service";


 export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public registerUser(req: Request, res: Response) {
        const data = req.body;

        if (!data.name || !data.email || !data.password || !data.telephone) {
            return res.status(400).json({
                error: "Nombre, email, contraseña y teléfono son obligatorios"
            });
        }

        const user = this.userService.createUser(data);
        return res.status(201).json(user);
    }
}