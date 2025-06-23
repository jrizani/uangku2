import {useMemo} from "react";
import {TransactionItem} from "./TransactionItem";
import {groupTransactionsByDate} from "../../utils/helpers";

export function TransactionList({transactions, wallets, onDeleteTransaction}) {
    const groupedTransactions = useMemo(() => groupTransactionsByDate(transactions), [transactions]);
    const sortedDates = useMemo(() => Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a)), [groupedTransactions]);
    if (transactions.length === 0) return <div className="text-center py-10 bg-white rounded-lg shadow-sm"><p
        className="text-gray-500">Tidak ada transaksi.</p></div>
    return (<div className="space-y-4"><h2 className="text-xl font-bold text-gray-600">Riwayat
        Transaksi</h2>{sortedDates.map(date => (<div key={date}><h3
        className="text-sm font-semibold text-gray-500 bg-gray-100 p-2 rounded sticky top-0">{new Date(date + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</h3>
        <div className="space-y-2 mt-1">{groupedTransactions[date].map(tx => (
            <TransactionItem key={tx.id} transaction={tx} onDelete={onDeleteTransaction} wallets={wallets}/>))}</div>
    </div>))}</div>);
}