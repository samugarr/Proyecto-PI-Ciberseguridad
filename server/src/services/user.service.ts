import { User, UserType } from "../model/user.model";
import { UserRepository } from "../repositories/json/user.repository";
import { EncryptionService } from "./encryption.service";
import { randomInt } from "crypto";


export class UserService {

    private userRepository: UserRepository;
    private encryptionService: EncryptionService;

    constructor() {
        this.userRepository = new UserRepository();
        this.encryptionService = new EncryptionService();
    }

    public getUsers(): User[] {
        return this.userRepository.getUsers();
    }

    public getUserByEmail(email: string): User | null {
        return this.userRepository.getUserByEmail(email);
    }

    public getUserByTelephone(telephone: string): User | null {
        return this.userRepository.getUserByTelephone(telephone);
    }

    public async createUser (
        userData: { name: string; email: string; password: string; salt: string; telephone: number }): Promise<User> {
        
        // comprobamos que el email introducido no está registrado
        let users = this.getUsers();
        const emailExists = users.some(user => user.email === userData.email);
        if (emailExists) {
            throw new Error("El email ya está registrado");
        }

        // comprobamos que el teléfono no está registrado (se usa para recibir transacciones)
        const telephoneExists = users.some(user => String(user.telephone) === String(userData.telephone));
        if (telephoneExists) {
            throw new Error("El teléfono ya está registrado");
        }
        

        // Usamos randomInt del módulo "crypto" de Node 
        let digits = "";
        for (let i = 0; i < 22; i++) {
            digits += randomInt(0, 10).toString();
        }
        const accountNumber = "ES" + digits; // ES + 22 dígitos

        // Algoritmo para cifrar número de cuenta y password
        //const accountNumberEncrypted = servicioqueencripte(accountNUmber);

        // userData.password ya NO es la contraseña: es K_auth, que el navegador
        // ha calculado con Argon2id. Aun así la volvemos a hashear con Argon2
        // aquí, para que si alguien roba users.json no pueda usar el hash
        // directamente para iniciar sesión.
        const passwordHash = await this.encryptionService.hashPassword(userData.password);

        const id = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        const newUser: User = {
            id: id,
            name: userData.name,
            email: userData.email,
            password: passwordHash,
            salt: userData.salt,
            userType: UserType.CLIENT,
            accountNumber: accountNumber,
            telephone: userData.telephone,
        };

        this.userRepository.createUser(newUser);
        return newUser;
    }

}