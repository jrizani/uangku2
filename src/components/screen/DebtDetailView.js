import {useMemo} from "react";
import {ArrowLeftIcon} from "../../utils/icons";
import {formatCurrency} from "../../utils/helpers";
import {TransactionList} from "./TransactionList";

export function DebtContactDetailView({contactName, transactions, wallets, contactBalances, onDeleteTransaction, onBack, onEditTransaction}) {
    const relevantTransactions = useMemo(() => transactions.filter(tx => tx.contactName === contactName), [transactions, contactName]);
    const balance = contactBalances[contactName] || 0;
    return (<div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto max-w-lg p-4 pb-24">
            <header className="flex items-center my-6">
                <button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon/></button>
                <h1 className="text-2xl font-bold">Riwayat dengan {contactName}</h1></header>
            <div className="bg-white rounded-xl shadow-md p-5 mb-6 text-center"><p
                className="text-sm uppercase">{balance > 0 ? 'Dia berhutang pada Anda' : balance < 0 ? 'Anda berhutang padanya' : 'Lunas'}</p>
                <p className={`text-4xl font-bold ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>{formatCurrency(Math.abs(balance))}</p>
            </div>
            <TransactionList transactions={relevantTransactions} wallets={wallets}
                             onDeleteTransaction={onDeleteTransaction} onEditTransaction={onEditTransaction}/></div>
    </div>)
}