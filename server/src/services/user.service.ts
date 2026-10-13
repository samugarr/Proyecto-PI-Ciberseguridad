import { User, UserType } from "../model/user.model";
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

    public async createUser (
        userData: { name: string; email: string; password: string; telephone: number }): Promise<User> {
        
        // comprobamos que el email introducido no está registrado
        let users = this.getUsers();
        const emailExists = users.some(user => user.email === userData.email);
        if (emailExists) {
            throw new Error("El email ya está registrado");
        }
        
        // creamos un número de cuenta aleatorio
        const accountNumber =   "ES" + Math.random().toString().slice(2, 24); // Genera un número aleatorio de 22 dígitos y lo convierte en string  

        // Algoritmo para cifrar número de cuenta y password
        //const accountNumberEncrypted = servicioqueencripte(accountNUmber);

        const passwordHash = await this.encryptionService.hashPassword(userData.password);

        const id = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        const newUser: User = {
            id: id,
            name: userData.name,
            email: userData.email,
            password: passwordHash,
            userType: UserType.CLIENT,
            accountNumber: accountNumber,
            telephone: userData.telephone,
        };

        this.userRepository.createUser(newUser);
        return newUser;
    }

}