// Transacciones tal como las devuelve GET /transactions. Mismos nombres de campo que el servidor.

export interface PartyView {
  id: number;
  name: string;
  telephone: string;
  maskedAccount: string;   // "ES** **** **** **** **** 1234"
}

export interface TransactionView {
  id: number;
  sender: PartyView;
  receiver: PartyView;
  description: string;
  amount: number;
  date: string;
}
