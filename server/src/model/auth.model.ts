import { UserType } from "./user.model";

// Identidad del usuario que hace la petición, extraída de un token verificado.
export interface AuthContext {
    userId: number;
    role: UserType;
    authTime: number;   // segundos Unix del login original; se conserva al renovar el token
}
