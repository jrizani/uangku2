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
import {useViewportAdjustments} from "./hooks/useViewportAdjustments";

function AppContent() {
    useViewportAdjustments();
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
    const tabViews = ['home', 'wallets', 'charts', 'settings'];

    const handleNavigate = (viewName) => {
        if (tabViews.includes(viewName)) {
            setActiveView(viewName);
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

    const renderHomeView = () => (
        <DashboardView
            wallets={wallets}
            categories={categories}
            walletBalances={walletBalances}
            totalBalance={totalBalance}
            transactions={transactionsWithFullCategory}
            onDeleteTransaction={handleDeleteTransaction}
            onSelectWallet={(id) => navigateTo('walletDetail', id)}
            onOpenWalletSettings={() => setIsWalletModalOpen(true)}
            onOpenDebtDashboard={() => navigateTo('debtDashboard')}
            totalDebt={totalDebt}
            totalReceivable={totalReceivable}
            onEditTransaction={handleOpenEditModal}
        />
    );

    const renderDashboardContent = () => {
        switch (activeView) {
            case 'home':
                return renderHomeView();
            case 'wallets':
                return (
                    <WalletsView
                        wallets={wallets}
                        walletBalances={walletBalances}
                        onOpenWalletSettings={() => setIsWalletModalOpen(true)}
                        onSelectWallet={(id) => navigateTo('walletDetail', id)}
                    />
                );
            case 'charts':
                return (
                    <ChartsView
                        transactions={transactionsWithFullCategory}
                        wallets={wallets}
                    />
                );
            case 'settings':
                return (
                    <SettingsView
                        categories={categories}
                        onUpdateCategory={handleUpdateCategory}
                        onAddCategory={handleAddCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onImportData={onImportData}
                        onLogout={onLogout}
                    />
                );
            default:
                return renderHomeView();
        }
    };

    const views = {
        dashboard: (
            <>
                {renderDashboardContent()}
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
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans antialiased text-gray-800" style={{ minHeight: '100dvh' }}>
            {views[currentView]}
            {currentView === 'dashboard' && (
                <div className="fixed right-6 z-40 bottom-safe" style={{ transform: 'translateY(var(--bottom-nav-offset))' }}>
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

    const handleImportData = (rawData) => {
        if (!rawData) {
            alert('File backup kosong atau tidak dapat dibaca.');
            return;
        }

        // eslint-disable-next-line no-restricted-globals
        if (confirm('Ini akan menimpa semua data yang ada. Apakah Anda yakin ingin melanjutkan?')) {
            try {
                const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

                if (typeof parsedData !== 'object' || parsedData === null) {
                    throw new Error('Struktur file tidak valid.');
                }

                const normalizedEntries = {};
                const aliasMap = {
                    moneyplus_wallets: ['moneyplus_wallets', 'wallets'],
                    moneyplus_transactions: ['moneyplus_transactions', 'transactions'],
                    moneyplus_categories: ['moneyplus_categories', 'categories'],
                    moneyplus_descriptions: ['moneyplus_descriptions', 'descriptions', 'history'],
                    moneyplus_contacts: ['moneyplus_contacts', 'contacts'],
                    moneyplus_pin: ['moneyplus_pin', 'pin']
                };

                Object.entries(parsedData).forEach(([key, value]) => {
                    if (key.startsWith('moneyplus_')) {
                        normalizedEntries[key] = value;
                    }
                });

                Object.entries(aliasMap).forEach(([targetKey, aliases]) => {
                    if (normalizedEntries[targetKey]) return;
                    aliases.forEach(alias => {
                        if (!normalizedEntries[targetKey] && Object.prototype.hasOwnProperty.call(parsedData, alias)) {
                            normalizedEntries[targetKey] = parsedData[alias];
                        }
                    });
                });

                if (!normalizedEntries.moneyplus_wallets || !normalizedEntries.moneyplus_transactions) {
                    throw new Error('File backup tidak memiliki data dompet atau transaksi.');
                }

                normalizedEntries.moneyplus_categories = normalizedEntries.moneyplus_categories || [];
                normalizedEntries.moneyplus_descriptions = normalizedEntries.moneyplus_descriptions || [];
                normalizedEntries.moneyplus_contacts = normalizedEntries.moneyplus_contacts || [];

                Object.keys(localStorage)
                    .filter(key => key.startsWith('moneyplus_'))
                    .forEach(key => localStorage.removeItem(key));

                Object.entries(normalizedEntries).forEach(([key, value]) => {
                    localStorage.setItem(key, JSON.stringify(value));
                });

                alert('Data berhasil diimpor! Aplikasi akan dimuat ulang.');
                window.location.reload();
            } catch (error) {
                console.error('Gagal memproses data impor:', error);
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
