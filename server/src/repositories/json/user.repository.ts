import { User } from "../../model/user.model";
import fs from "fs";
import path from "path";

export class UserRepository {
    private filePath: string;

    constructor() {
        this.filePath = path.join(process.cwd(), "/server/data/users.json");
    }

    createUser(user: User): User {
        const data = fs.readFileSync(this.filePath, "utf-8");
        const users: User[] = JSON.parse(data);      
        
        users.push(user);
        fs.writeFileSync(
            this.filePath,
            JSON.stringify(users, null, 2)
        );
        return user;
    }

    getUsers(): User[] {
        const data = fs.readFileSync(this.filePath, "utf-8");
        const users: User[] = JSON.parse(data);
        return users;
    }   
}