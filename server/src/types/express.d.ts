import { AuthContext } from "../model/auth.model";

// El middleware requireAuth añade req.auth a las peticiones con token válido.
declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}
