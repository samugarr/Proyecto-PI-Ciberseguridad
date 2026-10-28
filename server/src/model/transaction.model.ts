// Transacción tal como se guarda. Emisor y receptor se identifican por id de usuario,
// no por número de cuenta, para que el servidor no necesite conocer las cuentas.
export interface Transaction {
    id: number;
    senderId: number;
    receiverId: number;
    description: string;
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

// Datos de cada parte que se muestran en el listado. La cuenta va enmascarada.
export interface PartyView {
    id: number;
    name: string;
    telephone: string;
    maskedAccount: string;
}

// Transacción tal como se envía al cliente
export interface TransactionView {
    id: number;
    sender: PartyView;
    receiver: PartyView;
    description: string;
    amount: number;
    date: Date;
}
