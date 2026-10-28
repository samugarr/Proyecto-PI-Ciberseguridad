import { Transaction, TransactionView } from "../model/transaction.model";
import { User } from "../model/user.model";
import { toPartyView } from "./user.mapper";

export function toTransactionView(transaction: Transaction, sender: User, receiver: User): TransactionView {
    return {
        id: transaction.id,
        sender: toPartyView(sender),
        receiver: toPartyView(receiver),
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
    };
}
