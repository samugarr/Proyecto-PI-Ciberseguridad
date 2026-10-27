import { User } from "../model/user.model";
import { SecretRepository } from "../repositories/secret.repository";
import { EncryptionService } from "./encryption.service";
import { UserService } from "./user.service";

const SALT_BYTES = 16;
const FAKE_SALT_SECRET_FILE = "fake-salt.key";

export class LoginService {

    private encryptionService: EncryptionService;
    private userService: UserService;
    private fakeSaltKey: Buffer;

    constructor() {
        this.encryptionService = new EncryptionService();
        this.userService = new UserService();
        this.fakeSaltKey = new SecretRepository().getOrCreate(FAKE_SALT_SECRET_FILE, 32);
    }

    // Comprueba K_auth contra el hash guardado. Si el email no existe se verifica igualmente
    // contra un hash ficticio y se lanza el mismo error, para que ni el mensaje ni el tiempo
    // de respuesta revelen qué emails están registrados.
    public async login(email: string, kAuth: string): Promise<User> {
        const user = this.userService.getUserByEmail(email);
        const hash = user ? user.password : await this.encryptionService.getDummyHash();
        const isValid = await this.encryptionService.verifyPassword(hash, kAuth);

        if (!user || !isValid) {
            throw new Error("Credenciales incorrectas");
        }
        return user;
    }

    // Devuelve la sal del usuario. Si el email no existe devuelve una sal falsa pero estable,
    // HMAC-SHA256(secreto, email), indistinguible de una real para quien pregunta.
    public getSalt(email: string): string {
        const user = this.userService.getUserByEmail(email);
        if (user) {
            return user.salt;
        }
        return this.encryptionService.hmacHex(this.fakeSaltKey, email, SALT_BYTES);
    }
}
