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

// Datos que envía el cliente para crear una transacción. El emisor no va aquí:
// es siempre el usuario del token.
export interface NewTransactionData {
    telephoneTo: string;
    amount: number;
    description: string;
}
