import React, {useEffect, useMemo, useState} from 'react';
import {createId} from "./utils/helpers";
import {PinScreen} from "./components/screen/PinScreen";
import {DashboardView} from "./components/screen/DashboardView";
import {WalletDetailView} from "./components/screen/WalletDetailView";
import {DebtDashboardView} from "./components/screen/DebtDashboardView";
import {DebtContactDetailView} from "./components/screen/DebtDetailView";
import {PlusIcon} from "./utils/icons";
import {AddTransactionModal} from "./components/modal/AddTransactionModal";
import {WalletManagementModal} from "./components/modal/WalletManagementModal";
import {WalletsView} from "./components/screen/WalletsView";
import {BottomNavBar} from "./components/widget/BottomNavBar";
import {SettingsView} from "./components/screen/SettingsView";
import {ChartsView} from "./components/screen/ChartsView";

export default function App() {
    // --- State Management ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [descriptionHistory, setDescriptionHistory] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedId, setSelectedId] = useState(null);
    const [activeView, setActiveView] = useState('home');
    const [editingTransaction, setEditingTransaction] = useState(null);

    // --- PERBAIKAN: Pindahkan semua hook ke atas ---
    const {walletBalances, totalBalance, contactBalances, totalDebt, totalReceivable} = useMemo(() => {
        if (!isAuthenticated) return {
            walletBalances: {},
            totalBalance: 0,
            contactBalances: {},
            totalDebt: 0,
            totalReceivable: 0
        };
        const balances = wallets.reduce((acc, wallet) => ({...acc, [wallet.id]: 0}), {});
        const allContacts = new Set(contacts);
        transactions.forEach(tx => {
            if (tx.contactName) allContacts.add(tx.contactName)
        });
        const cBalances = Array.from(allContacts).reduce((acc, c) => ({...acc, [c]: 0}), {});

        transactions.forEach(t => {
            if (t.type === 'income') {
                if (balances[t.walletId] !== undefined) balances[t.walletId] += t.amount;
            } else if (t.type === 'expense') {
                if (balances[t.walletId] !== undefined) balances[t.walletId] -= t.amount;
            } else if (t.type === 'transfer') {
                if (balances[t.fromWalletId] !== undefined) balances[t.fromWalletId] -= t.amount;
                if (balances[t.toWalletId] !== undefined) balances[t.toWalletId] += t.amount;
            }

            if (t.contactName && cBalances[t.contactName] !== undefined) {
                const categoryObj = categories.find(c => c.id === t.category);
                const categoryName = categoryObj ? categoryObj.name : t.category;
                if (categoryName === 'Utang') cBalances[t.contactName] -= t.amount;
                else if (categoryName === 'Piutang') cBalances[t.contactName] += t.amount;
                else if (categoryName === 'Pembayaran Utang') cBalances[t.contactName] += t.amount;
                else if (categoryName === 'Penerimaan Piutang') cBalances[t.contactName] -= t.amount;
            }
        });

        const totalDebt = Object.values(cBalances).filter(b => b < 0).reduce((s, b) => s + b, 0);
        const totalReceivable = Object.values(cBalances).filter(b => b > 0).reduce((s, b) => s + b, 0);

        return {
            walletBalances: balances,
            totalBalance: Object.values(balances).reduce((s, b) => s + b, 0),
            contactBalances: cBalances,
            totalDebt,
            totalReceivable
        };
    }, [transactions, wallets, contacts, categories, isAuthenticated]);

    const transactionsWithFullCategory = useMemo(() => {
        return transactions.map(tx => {
            const categoryObj = categories.find(c => c.id === tx.category);
            return {...tx, category: categoryObj || { id: tx.category, name: tx.category, icon: null }};
        });
    }, [transactions, categories]);


    // --- Session & PIN Logic ---
    useEffect(() => {
        const sessionExpiry = localStorage.getItem('moneyplus_session_expiry');
        if (sessionExpiry && new Date().getTime() < parseInt(sessionExpiry, 10)) {
            setIsAuthenticated(true);
            resetSessionTimeout();
        }

        const handleActivity = () => resetSessionTimeout();
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keypress', handleActivity);
        window.addEventListener('click', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keypress', handleActivity);
            window.removeEventListener('click', handleActivity);
        };
    }, []);

    const resetSessionTimeout = () => {
        const oneHour = 60 * 60 * 1000;
        const expiryTime = new Date().getTime() + oneHour;
        localStorage.setItem('moneyplus_session_expiry', expiryTime.toString());
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        resetSessionTimeout();
    };

    // --- Data Loading ---
    useEffect(() => {
        if (!isAuthenticated) return;
        const loadData = () => {
            try {
                setWallets(JSON.parse(localStorage.getItem('moneyplus_wallets')) || [{
                    id: createId(),
                    name: 'Dompet Tunai'
                }]);

                const storedTransactions = JSON.parse(localStorage.getItem('moneyplus_transactions')) || [];

                const defaultCategories = [
                    { id: 'makanan', name: 'Makanan', icon: {type: 'fa', className: 'fas fa-utensils'}, color: '#ef5350' },
                    { id: 'transportasi', name: 'Transportasi', icon: {type: 'fa', className: 'fas fa-bus'}, color: '#42A5F5' },
                    { id: 'tagihan', name: 'Tagihan', icon: {type: 'fa', className: 'fas fa-file-invoice'}, color: '#FFA726' },
                    { id: 'belanja', name: 'Belanja', icon: {type: 'fa', className: 'fas fa-shopping-cart'}, color: '#26A69A' },
                    { id: 'hiburan', name: 'Hiburan', icon: {type: 'fa', className: 'fas fa-film'}, color: '#AB47BC' },
                    { id: 'kesehatan', name: 'Kesehatan', icon: {type: 'fa', className: 'fas fa-pills'}, color: '#EC407A'},
                    { id: 'pendidikan', name: 'Pendidikan', icon: {type: 'fa', className: 'fas fa-graduation-cap'}, color: '#5C6BC0'},
                    { id: 'hadiah', name: 'Hadiah', icon: {type: 'fa', className: 'fas fa-gift'}, color: '#FFEE58'},
                    { id: 'gaji', name: 'Gaji', icon: {type: 'fa', className: 'fas fa-dollar-sign'}, color: '#66BB6A'},
                    { id: 'biaya-admin', name: 'Biaya Admin', icon: {type: 'fa', className: 'fas fa-university'}, color: '#78909C' },
                    { id: 'penyesuaian', name: 'Penyesuaian', icon: {type: 'fa', className: 'fas fa-adjust'}, color: '#BDBDBD' },
                    { id: 'utang', name: 'Utang', icon: {type: 'fa', className: 'fas fa-hand-holding-usd'}, color: '#FF7043' },
                    { id: 'piutang', name: 'Piutang', icon: {type: 'fa', className: 'fas fa-hand-holding-usd'}, color: '#9CCC65' },
                    { id: 'pembayaran-utang', name: 'Pembayaran Utang', icon: {type: 'fa', className: 'fas fa-money-check-alt'}, color: '#D4E157' },
                    { id: 'penerimaan-piutang', name: 'Penerimaan Piutang', icon: {type: 'fa', className: 'fas fa-money-check-alt'}, color: '#29B6F6' },
                ];

                const storedCategories = JSON.parse(localStorage.getItem('moneyplus_categories')) || [];
                const migratedCategories = storedCategories.map(c => {
                    if (typeof c === 'string') {
                        const existing = defaultCategories.find(def => def.name.toLowerCase() === c.toLowerCase());
                        return existing || { id: c.toLowerCase().replace(/ /g, '-'), name: c, icon: null };
                    }
                    return c;
                });

                const categoryMap = new Map();
                defaultCategories.forEach(c => categoryMap.set(c.id, c));
                migratedCategories.forEach(c => categoryMap.set(c.id, c));
                const finalCategories = Array.from(categoryMap.values());
                setCategories(finalCategories);

                const migratedTransactions = storedTransactions.map(tx => {
                    if (typeof tx.category === 'object' && tx.category !== null) {
                        return { ...tx, category: tx.category.id };
                    }
                    return tx;
                });
                setTransactions(migratedTransactions);

                setDescriptionHistory(JSON.parse(localStorage.getItem('moneyplus_descriptions')) || []);
                setContacts(JSON.parse(localStorage.getItem('moneyplus_contacts')) || []);
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        };
        loadData();
    }, [isAuthenticated]);

    // --- Data Saving ---
    useEffect(() => {
        if (!isAuthenticated) return;
        try {
            localStorage.setItem('moneyplus_wallets', JSON.stringify(wallets));
            localStorage.setItem('moneyplus_transactions', JSON.stringify(transactions));
            localStorage.setItem('moneyplus_categories', JSON.stringify(categories));
            localStorage.setItem('moneyplus_descriptions', JSON.stringify(descriptionHistory));
            localStorage.setItem('moneyplus_contacts', JSON.stringify(contacts));
        } catch (error) {
            console.error("Failed to save data:", error);
        }
    }, [wallets, transactions, categories, descriptionHistory, contacts, isAuthenticated]);


    // --- Handlers ---
    const handleNavigate = (viewName) => {
        setActiveView(viewName);
        if (viewName === 'home' || viewName === 'wallets') {
            setCurrentView('dashboard');
        } else {
            setCurrentView(viewName);
        }
    };

    const handleAddTransactions = (newTxs) => {
        const allNewTxs = Array.isArray(newTxs) ? newTxs : [newTxs];
        setTransactions(prev => [...allNewTxs, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
        allNewTxs.forEach(tx => {
            if (tx.text && !descriptionHistory.includes(tx.text)) setDescriptionHistory(prev => [tx.text, ...prev].slice(0, 50));
            if (tx.contactName && !contacts.includes(tx.contactName)) setContacts(prev => [tx.contactName, ...prev]);
        });
        setIsModalOpen(false);
    };

    const handleEditTransaction = (updatedTx) => {
        setTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx).sort((a, b) => new Date(b.date) - new Date(a.date)));
        if (updatedTx.text && !descriptionHistory.includes(updatedTx.text)) {
            setDescriptionHistory(prev => [updatedTx.text, ...prev].slice(0, 50));
        }
        if (updatedTx.contactName && !contacts.includes(updatedTx.contactName)) {
            setContacts(prev => [updatedTx.contactName, ...prev]);
        }
        setEditingTransaction(null);
        setIsModalOpen(false);
    };

    const handleOpenEditModal = (tx) => {
        // Karena transaction WithFullCategory memiliki objek, kita perlu kembalikan ke ID
        const txWithId = {...tx, category: tx.category.id };
        setEditingTransaction(txWithId);
        setIsModalOpen(true);
    };

    const handleDeleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id));

    const handleAddCategory = (newCategoryData) => {
        const { name, icon } = newCategoryData;
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (name && !categories.some(c => c.id === id)) {
            const newCategory = { id, name, icon };
            setCategories(prev => [newCategory, ...prev]);
            return newCategory;
        }
        return categories.find(c => c.id === id) || null;
    };

    const handleUpdateCategory = (updatedCategory) => {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    };

    const handleDeleteCategory = (categoryId) => {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
    };

    const handleImportData = (data) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('Ini akan menimpa semua data yang ada. Apakah Anda yakin ingin melanjutkan?')) {
            try {
                // Validasi sederhana
                if (!data.moneyplus_transactions || !data.moneyplus_wallets || !data.moneyplus_categories) {
                    throw new Error('File tidak valid.');
                }

                // Hapus semua data lama
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('moneyplus_')) {
                        localStorage.removeItem(key);
                    }
                });

                // Tulis data baru ke localStorage
                for (const key in data) {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                }

                alert('Data berhasil diimpor! Aplikasi akan dimuat ulang.');
                // Muat ulang halaman untuk menerapkan semua state dari localStorage yang baru
                window.location.reload();

            } catch (error) {
                console.error("Gagal memproses data impor:", error);
                alert(`Gagal mengimpor data: ${error.message}`);
            }
        }
    };

    const handleAddWallet = (name, initialBalance) => {
        const newWallet = {id: createId(), name};
        setWallets(prev => [...prev, newWallet]);
        if (initialBalance > 0) handleAddTransactions({
            id: createId(),
            amount: initialBalance,
            text: 'Saldo Awal',
            category: 'penyesuaian',
            type: 'income',
            walletId: newWallet.id,
            date: new Date().toISOString()
        });
    };
    const handleEditWallet = (id, newName, newBalance) => {
        const currentBalance = walletBalances[id] || 0;
        const difference = Number(newBalance) - currentBalance;
        if (difference !== 0) handleAddTransactions({
            id: createId(),
            amount: Math.abs(difference),
            text: 'Penyesuaian Saldo',
            category: 'penyesuaian',
            type: difference > 0 ? 'income' : 'expense',
            walletId: id,
            date: new Date().toISOString()
        });
        setWallets(prev => prev.map(w => w.id === id ? {...w, name: newName} : w));
    };
    const handleDeleteWallet = (id) => setWallets(prev => prev.filter(w => w.id !== id));

    const navigateTo = (view, id = null) => {
        setSelectedId(id);
        setCurrentView(view);
    }

    if (!isAuthenticated) {
        return <PinScreen onSuccess={handleLoginSuccess}/>;
    }

    const views = {
        dashboard: (
            <>
                {activeView === 'home' &&
                    <DashboardView wallets={wallets} categories={categories} walletBalances={walletBalances} totalBalance={totalBalance}
                                   transactions={transactionsWithFullCategory} onDeleteTransaction={handleDeleteTransaction}
                                   onSelectWallet={(id) => navigateTo('walletDetail', id)}
                                   onOpenWalletSettings={() => setIsWalletModalOpen(true)}
                                   onOpenDebtDashboard={() => navigateTo('debtDashboard')} totalDebt={totalDebt}
                                   totalReceivable={totalReceivable} onEditTransaction={handleOpenEditModal}/>}
                {activeView === 'wallets' && <WalletsView wallets={wallets} walletBalances={walletBalances}
                                                          onOpenWalletSettings={() => setIsWalletModalOpen(true)}
                                                          onSelectWallet={(id) => navigateTo('walletDetail', id)}/>}
                <BottomNavBar activeView={activeView} onNavigate={handleNavigate} />
            </>
        ),
        walletDetail: <WalletDetailView walletId={selectedId} wallets={wallets} categories={categories} transactions={transactionsWithFullCategory}
                                        walletBalances={walletBalances} onDeleteTransaction={handleDeleteTransaction}
                                        onBack={() => { setCurrentView('dashboard'); setActiveView('wallets'); }}/>,
        debtDashboard: <DebtDashboardView contactBalances={contactBalances}
                                          onSelectContact={(name) => navigateTo('debtContactDetail', name)}
                                          onBack={() => { setCurrentView('dashboard'); setActiveView('home'); }}/>,
        debtContactDetail: <DebtContactDetailView contactName={selectedId} transactions={transactionsWithFullCategory} wallets={wallets} categories={categories}
                                                  contactBalances={contactBalances}
                                                  onDeleteTransaction={handleDeleteTransaction}
                                                  onEditTransaction={handleOpenEditModal}
                                                  onBack={() => navigateTo('debtDashboard')}/>,
        settings: <SettingsView onBack={() => {setCurrentView('dashboard'); setActiveView('home');}}
                                categories={categories}
                                onUpdateCategory={handleUpdateCategory}
                                onAddCategory={handleAddCategory}
                                onDeleteCategory={handleDeleteCategory} 
                                onImportData={handleImportData}/>,
        charts: <ChartsView onBack={() => {setCurrentView('dashboard'); setActiveView('home');}}
                            transactions={transactionsWithFullCategory}/>,
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans antialiased text-gray-800">
            {views[currentView]}
            {currentView === 'dashboard' && (
                <div className="fixed bottom-20 right-6 z-40">
                    <button onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"><PlusIcon/></button>
                </div>
            )}
            {isModalOpen &&
                <AddTransactionModal onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} onAddTransactions={handleAddTransactions}
                                     onEditTransaction={handleEditTransaction}
                                     transactionToEdit={editingTransaction}
                                     wallets={wallets} categories={categories} onAddCategory={handleAddCategory}
                                     descriptionHistory={descriptionHistory} contacts={contacts}
                                     contactBalances={contactBalances}/>}
            {isWalletModalOpen && <WalletManagementModal onClose={() => setIsWalletModalOpen(false)} wallets={wallets}
                                                         walletBalances={walletBalances} transactions={transactions}
                                                         onAdd={handleAddWallet} onEdit={handleEditWallet}
                                                         onDelete={handleDeleteWallet}/>}
            <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } @keyframes keypad-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-keypad-up { animation: keypad-up 0.2s ease-out forwards; } .shake { animation: shake 0.5s; } @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }`}</style>
        </div>
    );
}