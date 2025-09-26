import React, {useMemo, useState} from "react";
import {EditIcon, SettingsIcon, UsersIcon, WalletIcon} from "../../utils/icons";
import logo from "../../uangku_logo.png";
import {formatCurrency} from "../../utils/helpers";
import {TransactionList} from "./TransactionList";

export function DashboardView({
                                  wallets,
                                  categories,
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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedWallet, setSelectedWallet] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const txDate = new Date(tx.date);
            const matchesSearch = searchQuery.trim() === '' ||
                [tx.text, tx.contactName, tx.category?.name]
                    .filter(Boolean)
                    .some(field => field.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === 'all' || tx.category?.id === selectedCategory;

            const matchesWallet = selectedWallet === 'all' || tx.walletId === selectedWallet || tx.fromWalletId === selectedWallet || tx.toWalletId === selectedWallet;

            const matchesStartDate = !startDate || txDate >= new Date(startDate);
            const matchesEndDate = !endDate || txDate <= new Date(endDate + 'T23:59:59');

            return matchesSearch && matchesCategory && matchesWallet && matchesStartDate && matchesEndDate;
        });
    }, [transactions, searchQuery, selectedCategory, selectedWallet, startDate, endDate]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedWallet('all');
        setStartDate('');
        setEndDate('');
    };

    return (<div className="container mx-auto max-w-lg p-4 pb-24">
        <header className="flex items-center my-6"><img src={logo} alt="Logo uangku" width="100"/><h1
            className="text-3xl font-bold">uangku</h1>
            {/*<button onClick={onOpenSettings} className="text-gray-600 p-2"><SettingsIcon/></button>*/}
        </header>
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 text-center"><p className="text-sm uppercase">Total
            Saldo</p><p
            className={`text-4xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalBalance)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 space-y-3">
            <div className="grid grid-cols-1 gap-3">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Cari</label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari deskripsi, kontak, atau kategori"
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Dari Tanggal</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Sampai</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Kategori</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Dompet</label>
                        <select
                            value={selectedWallet}
                            onChange={(e) => setSelectedWallet(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="all">Semua Dompet</option>
                            {wallets.map(wallet => (
                                <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center pt-1 text-xs text-gray-500">
                <span>{filteredTransactions.length} transaksi ditemukan</span>
                <button onClick={handleResetFilters} className="text-blue-600 font-semibold">Reset</button>
            </div>
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
        <TransactionList transactions={filteredTransactions} wallets={wallets} onDeleteTransaction={onDeleteTransaction}
                         onEditTransaction={onEditTransaction} categories={categories}/>
    </div>);
}
