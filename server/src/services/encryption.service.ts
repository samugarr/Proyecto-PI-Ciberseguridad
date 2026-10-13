import argon2 from "argon2";


export class EncryptionService {


constructor() {}
    
    public hashPassword(password: string): Promise<string> {
        return argon2.hash(password);
    }

    public async verifyPassword(hash: string, password: string): Promise<boolean> {
        return argon2.verify(hash, password);
    }
}