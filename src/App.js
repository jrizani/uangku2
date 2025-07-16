import React, {useEffect, useState} from 'react';
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
import {AppProvider, useApp} from "./context/AppContext";

function AppContent() {
    // 1. Ambil semua data dan fungsi dari context global kita
    const {
        wallets, transactions, categories, descriptionHistory, contacts,
        walletBalances, totalBalance, contactBalances, totalDebt, totalReceivable, transactionsWithFullCategory,
        handleAddTransactions: handleAddTransactionsContext,
        handleEditTransaction: handleEditTransactionContext,
        handleDeleteTransaction,
        handleAddCategory, handleUpdateCategory, handleDeleteCategory, // Ambil dari context
        onLogout, onImportData,
        handleAddWallet, handleEditWallet, handleDeleteWallet
    } = useApp();

    // 2. State yang berhubungan dengan UI (seperti modal & navigasi) tetap di sini
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedId, setSelectedId] = useState(null);
    const [activeView, setActiveView] = useState('home');
    const [editingTransaction, setEditingTransaction] = useState(null);

    // --- Handlers ---
    const handleNavigate = (viewName) => {
        setActiveView(viewName);
        if (viewName === 'home' || viewName === 'wallets') {
            setCurrentView('dashboard');
        } else {
            setCurrentView(viewName);
        }
    };

    const handleAddTransactionsUI = (newTxs) => {
        handleAddTransactionsContext(newTxs, () => {
            setIsModalOpen(false);
        });
    };

    const handleEditTransactionUI = (updatedTx) => {
        handleEditTransactionContext(updatedTx, () => {
            setEditingTransaction(null);
            setIsModalOpen(false);
        });
    };

    const handleOpenEditModal = (tx) => {
        // Karena transaction WithFullCategory memiliki objek, kita perlu kembalikan ke ID
        const txWithId = {...tx, category: tx.category.id };
        setEditingTransaction(txWithId);
        setIsModalOpen(true);
    };

    const navigateTo = (view, id = null) => {
        setSelectedId(id);
        setCurrentView(view);
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
                                transactions={transactions}
                                onImportData={handleImportData}
                                onLogout={handleLogout}/>,
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
                <AddTransactionModal onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} onAddTransactions={handleAddTransactionsUI}
                                     onEditTransaction={handleEditTransactionUI}
                                     transactionToEdit={editingTransaction}/>}
            {isWalletModalOpen && <WalletManagementModal onClose={() => setIsWalletModalOpen(false)} wallets={wallets}
                                                         walletBalances={walletBalances} transactions={transactions}
                                                         onAdd={handleAddWallet} onEdit={handleEditWallet}
                                                         onDelete={handleDeleteWallet}/>}
            <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } @keyframes keypad-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-keypad-up { animation: keypad-up 0.2s ease-out forwards; } .shake { animation: shake 0.5s; } @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }`}</style>
        </div>
    );
}

export default function App() {
    // --- State Management for Authentication ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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

    const handleLogout = () => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('Anda yakin ingin keluar?')) {
            setIsAuthenticated(false);
            localStorage.removeItem('moneyplus_session_expiry');
        }
    };

    const handleImportData = (data) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('Ini akan menimpa semua data yang ada. Apakah Anda yakin ingin melanjutkan?')) {
            try {
                if (!data.moneyplus_transactions || !data.moneyplus_wallets || !data.moneyplus_categories) {
                    throw new Error('File tidak valid.');
                }
                Object.keys(localStorage).forEach(key => key.startsWith('moneyplus_') && localStorage.removeItem(key));
                for (const key in data) {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                }
                alert('Data berhasil diimpor! Aplikasi akan dimuat ulang.');
                window.location.reload();
            } catch (error) {
                console.error("Gagal memproses data impor:", error);
                alert(`Gagal mengimpor data: ${error.message}`);
            }
        }
    };

    if (!isAuthenticated) {
        return <PinScreen onSuccess={handleLoginSuccess}/>;
    }

    return (
        <AppProvider isAuthenticated={isAuthenticated} onLogout={handleLogout} onImportData={handleImportData}>
            <AppContent />
        </AppProvider>
    );
}