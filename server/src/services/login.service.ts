import { EncryptionService } from "./encryption.service";
import { UserService } from "./user.service";

export class LoginService {

    private encryptionService: EncryptionService;
    private userService: UserService;
    
    constructor() {
        this.encryptionService = new EncryptionService();
        this.userService = new UserService();   
    }


    
    public async login(email: string, password: string): Promise<void> {
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
        } else {
            throw new Error("Usuario no encontrado");
        }    
    }

}