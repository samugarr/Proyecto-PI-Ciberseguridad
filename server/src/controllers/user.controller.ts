import { Request, Response } from "express";
import { createUser } from "../services/user.service";

export function registerUser(req: Request, res: Response) {


    const data = req.body;
    //const { name, email, password } = data;

    if (!data.name || !data.email || !data.password) {
        return res.status(400).json({
            error: "Nombre, email y contraseña son obligatorios"
        });
    }

    const user = createUser(data);

    return res.status(201).json(user);
}