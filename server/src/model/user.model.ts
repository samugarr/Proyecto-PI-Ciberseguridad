export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    userType: UserType;
    accountNumber: string;
    telephone: number;
}   


export enum UserType {

    ADMIN = "admin",
    CLIENT = "client",
    OPERATOR = "operator",
}