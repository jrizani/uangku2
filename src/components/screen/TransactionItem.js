import React from "react";
import {ArrowDownIcon, ArrowUpIcon, EditIcon, TransferIcon, TrashIcon, WalletIcon} from "../../utils/icons";
import {formatCurrency} from "../../utils/helpers";
import { CategoryIcon } from "../widget/CategoryIcon";

export function TransactionItem({transaction, onDelete, wallets, onEdit}) {
    // Perubahan: Cari object kategori dari state `categories` yang dilewatkan
    const {text, amount, type, category, walletId, fromWalletId, toWalletId} = transaction;

    let color, sign, icon;
    const wallet = wallets.find(w => w.id === walletId);
    const fromWallet = wallets.find(w => w.id === fromWalletId);
    const toWallet = wallets.find(w => w.id === toWalletId);


    if (type === 'transfer') {
        color = 'text-gray-500';
        sign = '';
        icon = <TransferIcon/>;
    } else {
        color = type === 'income' ? 'text-green-500' : 'text-red-500';
        sign = type === 'income' ? '+' : '-';
        icon = type === 'income' ? <ArrowUpIcon/> : <ArrowDownIcon/>;
    }

    // Fallback jika kategori hanya string (data lama)
    const categoryName = typeof category === 'object' && category !== null ? category.name : category;
    const categoryIcon = typeof category === 'object' && category !== null ? category.icon : null;


    return (<div className="p-4 flex items-start justify-between">
        <div className="flex items-center space-x-3 min-w-0">
            <CategoryIcon icon={categoryIcon} name={categoryName} size="w-10 h-10" />
            <div className="min-w-0">
                <p className="font-semibold capitalize truncate">{text}</p>
                <div className="flex flex-wrap items-center gap-2 text-gray-500 mt-1">
                    <div className="flex items-center space-x-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                        <span>{categoryName}</span>
                    </div>
                    {wallet && <div className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        <WalletIcon/>
                        <span>{wallet.name}</span>
                    </div>}
                    {type === 'transfer' && fromWallet && toWallet && <div className="flex items-center space-x-1 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        <WalletIcon/>
                        <span>{fromWallet.name} → {toWallet.name}</span>
                    </div>}
                </div>
            </div>
        </div>
        <div className="flex flex-col items-end ml-2">
            <p className={`font-bold whitespace-nowrap ${color}`}>{sign} {formatCurrency(amount)}</p>
            <div className="flex items-center space-x-2 mt-1">
                <button onClick={() => onEdit(transaction)} className="text-gray-400 hover:text-blue-500">
                    <EditIcon/>
                </button>
                <button onClick={() => onDelete(transaction.id)} className="text-gray-400 hover:text-red-500">
                    <TrashIcon/>
                </button>
            </div>
        </div>
    </div>);
}