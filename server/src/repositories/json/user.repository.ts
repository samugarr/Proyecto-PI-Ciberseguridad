import path from "path";
import { User } from "../../model/user.model";
import { readJsonArray, writeJsonArray } from "./json-file";

export class UserRepository {
    private filePath: string;

    constructor() {
        this.filePath = path.join(process.cwd(), "server", "data", "users.json");
    }

    createUser(user: User): User {
        const users = this.getUsers();
        users.push(user);
        writeJsonArray(this.filePath, users);
        return user;
    }

    getUsers(): User[] {
        return readJsonArray<User>(this.filePath);
    }

    getUserById(id: number): User | undefined {
        return this.getUsers().find(user => user.id === id);
    }

    getUserByEmail(email: string): User | null {
        return this.getUsers().find(user => user.email === email) || null;
    }

    getUserByTelephone(telephone: string): User | null {
        return this.getUsers().find(user => String(user.telephone) === telephone) || null;
    }
}
