import {useMemo} from "react";
import {TransactionItem} from "./TransactionItem";
import {groupTransactionsByDate, formatCurrency, calculateDailyTotal} from "../../utils/helpers";

export function TransactionList({transactions, wallets, categories, onDeleteTransaction, onEditTransaction}) { // Tambah `categories`
    const groupedTransactions = useMemo(() => groupTransactionsByDate(transactions), [transactions]);
    const sortedDates = useMemo(() => Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a)), [groupedTransactions]);

    if (transactions.length === 0) return <div className="text-center py-10 bg-white rounded-lg shadow-sm"><p
        className="text-gray-500">Tidak ada transaksi.</p></div>

    return (<div className="space-y-4"><h2 className="text-xl font-bold text-gray-600 mb-4">Riwayat
        Transaksi</h2>{sortedDates.map(date => {
        const dailyTotal = calculateDailyTotal(groupedTransactions[date]);
        return (<div key={date} className="bg-white rounded-lg shadow-sm overflow-hidden"><div
            className="bg-gray-50 p-3 flex justify-between items-center sticky top-0 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600">{new Date(date).toLocaleDateString('id-ID', {
                timeZone: 'UTC',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</h3>
            <span
                className={`text-sm font-bold ${dailyTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(dailyTotal)}</span>
        </div>
            <div className="divide-y divide-gray-100">{groupedTransactions[date].map(tx => (
                <TransactionItem key={tx.id} transaction={tx} onDelete={onDeleteTransaction} wallets={wallets} categories={categories} onEdit={onEditTransaction}/>))}</div>
        </div>) // Teruskan `categories`
    })}</div>);
}