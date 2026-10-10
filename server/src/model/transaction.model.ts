export interface Transaction {
    id: number;
    accountFrom: string;
    accountTo: string;
    telephoneFrom: string;
    telephoneTo: string;
    description?: string;
    amount: number;
    date: Date;
}   
