import { PublicUser, User } from "../model/user.model";
import { PartyView } from "../model/transaction.model";

// Datos de un usuario que se pueden enviar al cliente: sin hash ni material criptográfico.
export function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        telephone: user.telephone,
        userType: user.userType,
    };
}

// Datos de un usuario que ve la otra parte de una transacción: nunca la cuenta completa.
export function toPartyView(user: User): PartyView {
    return {
        id: user.id,
        name: user.name,
        telephone: user.telephone,
        maskedAccount: maskAccount(user.accountLast4),
    };
}

// El servidor solo conoce los 4 últimos dígitos: "ES** **** **** **** **** 1234"
function maskAccount(accountLast4: string): string {
    return "ES** **** **** **** **** " + accountLast4;
}
