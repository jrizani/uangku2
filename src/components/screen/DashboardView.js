import React from "react";
import {EditIcon, SettingsIcon, UsersIcon, WalletIcon} from "../../utils/icons";
import logo from "../../uangku_logo.png";
import {formatCurrency} from "../../utils/helpers";
import {TransactionList} from "./TransactionList";

export function DashboardView({
                                  wallets,
                                  walletBalances,
                                  totalBalance,
                                  transactions,
                                  onDeleteTransaction,
                                  onEditTransaction,
                                  onSelectWallet,
                                  onOpenWalletSettings,
                                  onOpenDebtDashboard,
                                  totalDebt,
                                  totalReceivable,
                                  onOpenSettings
                              }) {
    return (<div className="container mx-auto max-w-lg p-4 pb-24">
        <header className="flex justify-between items-center my-6"><img src={logo} alt="Logo uangku" width="100"/><h1
            className="text-3xl font-bold">uangku</h1>
            <button onClick={onOpenSettings} className="text-gray-600 p-2"><SettingsIcon/></button>
        </header>
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 text-center"><p className="text-sm uppercase">Total
            Saldo</p><p
            className={`text-4xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalBalance)}</p>
        </div>
        <div className="mb-6 bg-white rounded-xl shadow-md p-5 cursor-pointer" onClick={onOpenDebtDashboard}>
            <div className="flex items-center justify-between mb-2"><h2 className="text-xl font-bold">Utang Piutang</h2>
                <UsersIcon/></div>
            <div className="flex justify-around">
                <div className="text-center"><p className="text-sm uppercase text-red-500">Utang Saya</p><p
                    className="font-bold text-lg text-red-600">{formatCurrency(Math.abs(totalDebt))}</p></div>
                <div className="text-center"><p className="text-sm uppercase text-green-500">Piutang</p><p
                    className="font-bold text-lg text-green-600">{formatCurrency(totalReceivable)}</p></div>
            </div>
        </div>
        <TransactionList transactions={transactions} wallets={wallets} onDeleteTransaction={onDeleteTransaction} onEditTransaction={onEditTransaction}/>
    </div>);
}