import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createId} from "./utils/helpers";
import {PinScreen} from "./components/screen/PinScreen";
import {DashboardView} from "./components/screen/DashboardView";
import {WalletDetailView} from "./components/screen/WalletDetailView";
import {DebtDashboardView} from "./components/screen/DebtDashboardView";
import {DebtContactDetailView} from "./components/screen/DebtDetailView";
import {PlusIcon} from "./utils/icons";
import {AddTransactionModal} from "./components/modal/AddTransactionModal";
import {WalletManagementModal} from "./components/modal/WalletManagementModal";
import {SettingsModal} from "./components/modal/SettingModal";
import {WalletsView} from "./components/screen/WalletsView";
import {BottomNavBar} from "./components/widget/BottomNavBar";

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
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedId, setSelectedId] = useState(null);
    const [activeView, setActiveView] = useState('home');
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleNavigate = (viewName) => {
        setActiveView(viewName);
    };

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
                setTransactions(JSON.parse(localStorage.getItem('moneyplus_transactions')) || []);
                const defaultCategories = ['Makanan', 'Transportasi', 'Tagihan', 'Belanja', 'Hiburan', 'Biaya Admin', 'Penyesuaian', 'Utang', 'Piutang', 'Pembayaran Utang', 'Penerimaan Piutang'];
                setCategories(Array.from(new Set([...defaultCategories, ...(JSON.parse(localStorage.getItem('moneyplus_categories')) || [])])));
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

    // --- Business Logic ---
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
                if (t.category === 'Utang') cBalances[t.contactName] -= t.amount;
                else if (t.category === 'Piutang') cBalances[t.contactName] += t.amount;
                else if (t.category === 'Pembayaran Utang') cBalances[t.contactName] += t.amount;
                else if (t.category === 'Penerimaan Piutang') cBalances[t.contactName] -= t.amount;
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
    }, [transactions, wallets, contacts, isAuthenticated]);

    // --- Handlers ---
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
        setEditingTransaction(tx);
        setIsModalOpen(true);
    };

    const handleDeleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id));
    const handleAddCategory = (newCategory) => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories(prev => [newCategory, ...prev]);
            return true;
        }
        return false;
    };
    const handleAddWallet = (name, initialBalance) => {
        const newWallet = {id: createId(), name};
        setWallets(prev => [...prev, newWallet]);
        if (initialBalance > 0) handleAddTransactions({
            id: createId(),
            amount: initialBalance,
            text: 'Saldo Awal',
            category: 'Penyesuaian',
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
            category: 'Penyesuaian',
            type: difference > 0 ? 'income' : 'expense',
            walletId: id,
            date: new Date().toISOString()
        });
        setWallets(prev => prev.map(w => w.id === id ? {...w, name: newName} : w));
    };
    const handleDeleteWallet = (id) => setWallets(prev => prev.filter(w => w.id !== id));

    // --- View Navigation ---
    const navigateTo = (view, id = null) => {
        setSelectedId(id);
        setCurrentView(view);
    }

    if (!isAuthenticated) {
        return <PinScreen onSuccess={handleLoginSuccess}/>;
    }

    const views = {
        dashboard: <>
            {activeView === 'home' &&
                <DashboardView wallets={wallets} walletBalances={walletBalances} totalBalance={totalBalance}
                               transactions={transactions} onDeleteTransaction={handleDeleteTransaction}
                               onSelectWallet={(id) => navigateTo('walletDetail', id)}
                               onOpenWalletSettings={() => setIsWalletModalOpen(true)}
                               onOpenDebtDashboard={() => navigateTo('debtDashboard')} totalDebt={totalDebt}
                               totalReceivable={totalReceivable} onEditTransaction={handleOpenEditModal}
                               onOpenSettings={() => setIsSettingsModalOpen(true)}/>}
            {activeView === 'wallets' && <WalletsView wallets={wallets} walletBalances={walletBalances}
                                                      onOpenWalletSettings={() => setIsWalletModalOpen(true)}
                                                      onSelectWallet={(id) => navigateTo('walletDetail', id)}/>}
            <BottomNavBar activeView={activeView} onNavigate={handleNavigate} />
        </>,
        walletDetail: <WalletDetailView walletId={selectedId} wallets={wallets} transactions={transactions}
                                        walletBalances={walletBalances} onDeleteTransaction={handleDeleteTransaction}
                                        onBack={() => navigateTo('dashboard')}/>,
        debtDashboard: <DebtDashboardView contactBalances={contactBalances}
                                          onSelectContact={(name) => navigateTo('debtContactDetail', name)}
                                          onBack={() => navigateTo('dashboard')}/>,
        debtContactDetail: <DebtContactDetailView contactName={selectedId} transactions={transactions} wallets={wallets}
                                                  contactBalances={contactBalances}
                                                  onDeleteTransaction={handleDeleteTransaction}
                                                  onBack={() => navigateTo('debtDashboard')}/>
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans antialiased text-gray-800">
            {views[currentView]}
            <div className="fixed bottom-6 right-6 z-40">
                <button onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white rounded-full p-4 shadow-lg"><PlusIcon/></button>
            </div>
            {isModalOpen &&
                <AddTransactionModal onClose={() => setIsModalOpen(false)} onAddTransactions={handleAddTransactions}
                                     onEditTransaction={handleEditTransaction}
                                     transactionToEdit={editingTransaction}
                                     wallets={wallets} categories={categories} onAddCategory={handleAddCategory}
                                     descriptionHistory={descriptionHistory} contacts={contacts}
                                     contactBalances={contactBalances}/>}
            {isWalletModalOpen && <WalletManagementModal onClose={() => setIsWalletModalOpen(false)} wallets={wallets}
                                                         walletBalances={walletBalances} transactions={transactions}
                                                         onAdd={handleAddWallet} onEdit={handleEditWallet}
                                                         onDelete={handleDeleteWallet}/>}
            {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)}/>}
            <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } @keyframes keypad-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-keypad-up { animation: keypad-up 0.2s ease-out forwards; } .shake { animation: shake 0.5s; } @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }`}</style>
        </div>
    );
}