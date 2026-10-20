import { EncryptionService } from "./encryption.service";
import { UserService } from "./user.service";
import { User } from "../model/user.model";

export class LoginService {

    private encryptionService: EncryptionService;
    private userService: UserService;
    
    constructor() {
        this.encryptionService = new EncryptionService();
        this.userService = new UserService();   
    }


    
    // Devuelve el usuario autenticado para que el cliente sepa su cuenta
    public async login(email: string, password: string): Promise<User> {
        // Aquí iría la lógica de autenticación, por ejemplo, verificar el correo electrónico y la contraseña en la base de datos.
        // Por simplicidad, vamos a asumir que el correo electrónico es "admin@example.com" y la contraseña es "password".

        const user = this.userService.getUserByEmail(email);
        if (user) {
            const isValid = await this.encryptionService.verifyPassword(
                user.password,
                password
            );
            if (!isValid) {
                throw new Error("Credenciales incorrectas");
            }
            return user;
        } else {
            throw new Error("Usuario no encontrado");
        }    
    }


    // Devuelve la sal del usuario para que el navegador pueda derivar K_auth
    public getSalt(email: string): string {
        const user = this.userService.getUserByEmail(email);
        if (!user || !user.salt) {
            throw new Error("Usuario no encontrado");
        }
        return user.salt;
    }

}
