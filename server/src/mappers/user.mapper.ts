import { PublicUser, User } from "../model/user.model";

// Datos de un usuario que se pueden enviar al cliente: sin hash ni material criptográfico.
export function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        telephone: user.telephone,
        accountNumber: user.accountNumber,
        userType: user.userType,
    };
}
