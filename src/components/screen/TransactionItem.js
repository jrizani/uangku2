import React from "react";
import {ArrowDownIcon, ArrowUpIcon, TagIcon, TransferIcon, TrashIcon} from "../../utils/icons";
import {formatCurrency} from "../../utils/helpers";

export function TransactionItem({transaction, onDelete, wallets}) {
    const {text, amount, type, category} = transaction;
    let color, sign, icon;
    if (type === 'transfer') {
        color = 'text-gray-500';
        sign = '';
        icon = <TransferIcon/>;
    } else {
        color = type === 'income' ? 'text-green-500' : 'text-red-500';
        sign = type === 'income' ? '+' : '-';
        icon = type === 'income' ? <ArrowUpIcon/> : <ArrowDownIcon/>;
    }
    return (<div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 min-w-0">
            <div
                className={`p-2 rounded-full flex-shrink-0 ${type === 'income' ? 'bg-green-100' : type === 'expense' ? 'bg-red-100' : 'bg-gray-100'}`}>{icon}</div>
            <div className="min-w-0"><p className="font-semibold capitalize truncate">{text}</p>
                <div className="flex items-center space-x-2 text-gray-500">
                    <div className="flex items-center space-x-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full"><TagIcon/><span>{category}</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0"><p
            className={`font-bold text-right ${color}`}>{sign} {formatCurrency(amount)}</p>
            <button onClick={() => onDelete(transaction.id)} className="text-gray-400 hover:text-red-500"><TrashIcon/>
            </button>
        </div>
    </div>);
}