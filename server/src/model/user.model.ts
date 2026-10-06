export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    userType: UserType;
    accountNumber?: string;
}   


export enum UserType {

    ADMIN = "admin",
    CLIENT = "client"
}