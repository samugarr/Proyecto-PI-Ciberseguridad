import { User, UserType } from "../model/user.model";
import { UserRepository } from "../repositories/json/user.repository";


export class UserService {

    private userRepository: UserRepository;
    constructor() {
        this.userRepository = new UserRepository();
    }

    public createUser (
        userData: { name: string; email: string; password: string; telephone: number }): User {
        
        // comprobamos que el email introducido no está registrado
        let users = this.userRepository.getUsers();
        const emailExists = users.some(user => user.email === userData.email);
        if (emailExists) {
            throw new Error("El email ya está registrado");
        }
        
        // creamos un número de cuenta aleatorio
        const accountNumber =  this.generarIBAN();

        // Algoritmo para cifrar número de cuenta y password
        //const accountNumberEncrypted = servicioqueencripte(accountNUmber);
        //const passencriptada = servicioqueencripte(userData.password);
        
        const id = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        const newUser: User = {
            id: id,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            userType: UserType.CLIENT,
            accountNumber: accountNumber,
            telephone: userData.telephone,
        };

        this.userRepository.createUser(newUser);
        return newUser;
    }


    public generarIBAN(): string {
        // Generamos números aleatorios para los datos de la cuenta
        const banco = this.generarDigitos(4);
        const sucursal = this.generarDigitos(4);
        const cuenta = this.generarDigitos(10);

        // Calculamos los dígitos de control nacionales
        const dcNacional = this.calcularDC(banco + sucursal + cuenta);

        // Formamos el CCC (Código Cuenta Cliente)
        const ccc = banco + sucursal + dcNacional + cuenta;

        // Calculamos los dígitos de control del IBAN
        const ibanNumerico = ccc + "142800"; // ES = 14, 28; y se añaden 00
        const resto = this.modulo97(ibanNumerico);
        const dcIBAN = String(98 - resto).padStart(2, "0");

        return "ES" + dcIBAN + ccc;
    }

    // Genera una cadena de dígitos aleatorios
    public generarDigitos(longitud: number): string {
        let resultado = "";

        for (let i = 0; i < longitud; i++) {
            resultado += Math.floor(Math.random() * 10);
        }

        return resultado;
    }


    // Calcula los dos dígitos de control nacionales del CCC

    public calcularDC(datos: string): string {
        const bancoSucursal = datos.substring(0, 8);
        const numeroCuenta = datos.substring(8, 18);

        const calcular = (cadena: string, pesos: number[]): number => {
            let suma = 0;

            for (let i = 0; i < cadena.length; i++) {
                suma += Number(cadena[i]) * pesos[i];
            }

            const resto = suma % 11;
            const resultado = 11 - resto;

            if (resultado === 11) return 0;
            if (resultado === 10) return 1;

            return resultado;
        };

        // Se añaden dos ceros delante del código de banco y sucursal
        const dc1 = calcular("00" + bancoSucursal, [
            1, 2, 4, 8, 5, 10, 9, 7, 3, 6
        ]);

        const dc2 = calcular(numeroCuenta, [
            1, 2, 4, 8, 5, 10, 9, 7, 3, 6
        ]);

        return `${dc1}${dc2}`;
    }


    // Calcula el resto de una cadena numérica al dividirla entre 97
    public modulo97(numero: string): number {
        let resto = 0;

        for (const digito of numero) {
            resto = (resto * 10 + Number(digito)) % 97;
        }

        return resto;
    }

}