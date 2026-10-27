import { randomInt } from "crypto";
import { NewUserData, User, UserType } from "../model/user.model";
import { UserRepository } from "../repositories/json/user.repository";
import { EncryptionService } from "./encryption.service";

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

    public async createUser(data: NewUserData): Promise<User> {
        const users = this.getUsers();
        this.ensureIsNotRegistered(users, data);

        // data.kAuth no es la contraseña: es K_auth, derivada en el navegador con Argon2id.
        // Se vuelve a hashear para que, si roban users.json, el valor guardado no sirva para iniciar sesión.
        const passwordHash = await this.encryptionService.hashPassword(data.kAuth);

        const newUser: User = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            name: data.name,
            email: data.email,
            password: passwordHash,
            salt: data.salt,
            userType: UserType.CLIENT,
            accountNumber: this.generateAccountNumber(),
            telephone: data.telephone,
            publicKey: data.publicKey,
            encryptedPrivateKey: data.encryptedPrivateKey,
            privateKeyIv: data.privateKeyIv,
        };

        this.userRepository.createUser(newUser);
        return newUser;
    }

    private ensureIsNotRegistered(users: User[], data: NewUserData): void {
        if (users.some(user => user.email === data.email)) {
            throw new Error("El email ya está registrado");
        }
        // El teléfono identifica al destinatario de las transacciones, así que tiene que ser único
        if (users.some(user => String(user.telephone) === data.telephone)) {
            throw new Error("El teléfono ya está registrado");
        }
    }

    // ES + 22 dígitos generados con randomInt (CSPRNG de Node)
    private generateAccountNumber(): string {
        let digits = "";
        for (let i = 0; i < 22; i++) {
            digits += randomInt(0, 10).toString();
        }
        return "ES" + digits;
    }
}
