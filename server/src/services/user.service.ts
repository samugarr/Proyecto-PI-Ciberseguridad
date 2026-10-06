import fs from "fs";
import path from "path";
import { User, UserType } from "../model/user.model";

const filePath = path.join(process.cwd(), "/server/data/users.json");

export function createUser (
    userData: { name: string; email: string; password: string }
): User {

    const data = fs.readFileSync(filePath, "utf-8");
    const users: User[] = JSON.parse(data);

    //const passencriptada = servicioqueencripte(userData.password);
    const newUser: User = {
        id: users.length + 1,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        userType: UserType.CLIENT,
    };

    users.push(newUser);

    fs.writeFileSync(
        filePath,
        JSON.stringify(users, null, 2)
    );

    return newUser;
}