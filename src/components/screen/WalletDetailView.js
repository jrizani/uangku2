import React, {useMemo} from "react";
import {ArrowLeftIcon} from "../../utils/icons";
import {formatCurrency} from "../../utils/helpers";
import {TransactionList} from "./TransactionList";

export function WalletDetailView({walletId, wallets, transactions, walletBalances, onDeleteTransaction, onBack, categories}) {
    const wallet = wallets.find(w => w.id === walletId);
    const relevantTransactions = useMemo(() => transactions.filter(tx => tx.walletId === walletId || tx.fromWalletId === walletId || tx.toWalletId === walletId), [transactions, walletId]);
    if (!wallet) return <div className="p-10 text-center">Dompet tidak ditemukan. <button
        onClick={onBack}>Kembali</button></div>;
    return (<div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto max-w-lg p-4 pb-24">
            <header className="flex items-center my-6">
                <button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon/></button>
                <h1 className="text-2xl font-bold">{wallet.name}</h1></header>
            <div className="bg-white rounded-xl shadow-md p-5 mb-6 text-center"><p className="text-sm uppercase">Saldo
                Saat Ini</p><p
                className={`text-4xl font-bold ${walletBalances[wallet.id] >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(walletBalances[wallet.id] || 0)}</p>
            </div>
            <TransactionList transactions={relevantTransactions} wallets={wallets}
                             onDeleteTransaction={onDeleteTransaction} categories={categories}/></div>
    </div>);
}