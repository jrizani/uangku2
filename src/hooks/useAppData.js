// src/hooks/useAppData.js
import {useCallback, useEffect, useMemo, useState} from 'react';
import {createId, getRandomColor} from "../utils/helpers";

const ACCOUNT_STORAGE_KEY = 'moneyplus_accounts';
const ACTIVE_ACCOUNT_STORAGE_KEY = 'moneyplus_active_account';
const ACCOUNT_DATA_SUFFIXES = ['wallets', 'transactions', 'categories', 'descriptions', 'contacts', 'pin'];

const getAccountScopedKey = (accountId, suffix) => `moneyplus_${accountId}_${suffix}`;

const baseDefaultCategories = [
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
    { id: 'piutang', name: 'Piutang', icon: {type: 'fa', className: 'fas fa-hand-holding-usd'}, color: '#42A5F5' },
    { id: 'pembayaran-utang', name: 'Pembayaran Utang', icon: {type: 'fa', className: 'fas fa-handshake'}, color: '#F57C00' },
    { id: 'penerimaan-piutang', name: 'Penerimaan Piutang', icon: {type: 'fa', className: 'fas fa-handshake'}, color: '#66BB6A' },
];

const createDefaultWallet = () => ({
    id: createId(),
    name: 'Dompet Tunai'
});

export const useAppData = (isAuthenticated) => {
    // --- State Management ---
    const [accounts, setAccounts] = useState([]);
    const [activeAccountId, setActiveAccountId] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [descriptionHistory, setDescriptionHistory] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [isDataReady, setIsDataReady] = useState(false);

    // --- Kalkulasi (Derived State) ---
    const {walletBalances, totalBalance, contactBalances, totalDebt, totalReceivable} = useMemo(() => {
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
    }, [transactions, wallets, contacts, categories]);

    const transactionsWithFullCategory = useMemo(() => {
        return transactions.map(tx => {
            const categoryObj = categories.find(c => c.id === tx.category);
            return {...tx, category: categoryObj || { id: tx.category, name: tx.category, icon: null }};
        });
    }, [transactions, categories]);


    const mergeCategoriesWithDefaults = useCallback((existingCategories = []) => {
        const migratedCategories = existingCategories.map(c => {
            if (typeof c === 'string') {
                const existing = baseDefaultCategories.find(def => def.name.toLowerCase() === c.toLowerCase());
                return existing || { id: c.toLowerCase().replace(/ /g, '-'), name: c, icon: null };
            }
            return c;
        });

        const categoryMap = new Map();
        baseDefaultCategories.forEach(c => categoryMap.set(c.id, c));
        migratedCategories.forEach(c => categoryMap.set(c.id, c));
        return Array.from(categoryMap.values());
    }, []);

    const loadAccountData = useCallback((accountId) => {
        if (!accountId) return;

        try {
            const read = (suffix) => {
                const storedValue = localStorage.getItem(getAccountScopedKey(accountId, suffix));
                return storedValue ? JSON.parse(storedValue) : null;
            };

            const storedWallets = read('wallets');
            const walletsToUse = Array.isArray(storedWallets) && storedWallets.length > 0 ? storedWallets : [createDefaultWallet()];
            const storedTransactions = read('transactions') || [];
            const normalizedTransactions = storedTransactions.map(tx => {
                if (typeof tx.category === 'object' && tx.category !== null) {
                    return { ...tx, category: tx.category.id };
                }
                return tx;
            }).sort((a, b) => new Date(b.date) - new Date(a.date));

            const storedCategories = read('categories') || [];
            const finalCategories = mergeCategoriesWithDefaults(storedCategories);

            const storedDescriptions = read('descriptions') || [];
            const storedContacts = read('contacts') || [];

            setWallets(walletsToUse);
            setTransactions(normalizedTransactions);
            setCategories(finalCategories);
            setDescriptionHistory(storedDescriptions);
            setContacts(storedContacts);
            setIsDataReady(true);
        } catch (error) {
            console.error('Failed to load account data:', error);
        }
    }, [mergeCategoriesWithDefaults]);

    // --- Account Loading & Migration ---
    useEffect(() => {
        if (!isAuthenticated) return;

        const storedAccounts = JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY)) || [];

        if (storedAccounts.length === 0) {
            const defaultAccount = { id: createId(), name: 'Pribadi' };

            // migrate legacy single-account data if present
            try {
                const legacyData = ACCOUNT_DATA_SUFFIXES.reduce((acc, suffix) => {
                    const legacyValue = localStorage.getItem(`moneyplus_${suffix}`);
                    if (legacyValue) acc[suffix] = JSON.parse(legacyValue);
                    return acc;
                }, {});

                ACCOUNT_DATA_SUFFIXES.forEach(suffix => {
                    const value = legacyData[suffix];
                    if (value !== undefined) {
                        localStorage.setItem(getAccountScopedKey(defaultAccount.id, suffix), JSON.stringify(value));
                    }
                });
            } catch (error) {
                console.error('Failed to migrate legacy data:', error);
            }

            localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify([defaultAccount]));
            localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, defaultAccount.id);
            setAccounts([defaultAccount]);
            setActiveAccountId(defaultAccount.id);
            loadAccountData(defaultAccount.id);
            return;
        }

        const storedActiveAccount = localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY);
        const resolvedActiveAccount = storedAccounts.some(acc => acc.id === storedActiveAccount)
            ? storedActiveAccount
            : storedAccounts[0]?.id || null;

        setAccounts(storedAccounts);
        setActiveAccountId(resolvedActiveAccount);

        if (resolvedActiveAccount) {
            loadAccountData(resolvedActiveAccount);
        }
    }, [isAuthenticated, loadAccountData]);

    useEffect(() => {
        if (!isAuthenticated || !activeAccountId || !isDataReady) return;

        const write = (suffix, value) => {
            try {
                localStorage.setItem(getAccountScopedKey(activeAccountId, suffix), JSON.stringify(value));
            } catch (error) {
                console.error('Failed to save account data:', error);
            }
        };

        write('wallets', wallets);
        write('transactions', transactions);
        write('categories', categories);
        write('descriptions', descriptionHistory);
        write('contacts', contacts);
    }, [wallets, transactions, categories, descriptionHistory, contacts, isAuthenticated, activeAccountId, isDataReady]);

    useEffect(() => {
        if (!isAuthenticated || accounts.length === 0) return;
        try {
            localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
        } catch (error) {
            console.error('Failed to persist accounts:', error);
        }
    }, [accounts, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !activeAccountId) return;
        try {
            localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, activeAccountId);
        } catch (error) {
            console.error('Failed to persist active account:', error);
        }
    }, [activeAccountId, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !activeAccountId) return;
        setIsDataReady(false);
        loadAccountData(activeAccountId);
    }, [activeAccountId, isAuthenticated, loadAccountData]);


    // --- Handlers ---
    const handleAddTransactions = (newTxs, callback) => {
        const allNewTxs = Array.isArray(newTxs) ? newTxs : [newTxs];
        setTransactions(prev => [...allNewTxs, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
        allNewTxs.forEach(tx => {
            if (tx.text && !descriptionHistory.includes(tx.text)) setDescriptionHistory(prev => [tx.text, ...prev].slice(0, 50));
            if (tx.contactName && !contacts.includes(tx.contactName)) setContacts(prev => [tx.contactName, ...prev]);
        });
        if (callback) callback();
    };

    const handleEditTransaction = (updatedTx, callback) => {
        setTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx).sort((a, b) => new Date(b.date) - new Date(a.date)));
        if (updatedTx.text && !descriptionHistory.includes(updatedTx.text)) {
            setDescriptionHistory(prev => [updatedTx.text, ...prev].slice(0, 50));
        }
        if (updatedTx.contactName && !contacts.includes(updatedTx.contactName)) {
            setContacts(prev => [updatedTx.contactName, ...prev]);
        }
        if (callback) callback();
    };

    const handleDeleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id));

    const handleAddCategory = (newCategoryData) => {
        const { name, icon = null, color } = newCategoryData || {};
        if (!name) return null;

        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const existingCategory = categories.find(c => c.id === id);
        if (existingCategory) {
            return existingCategory;
        }

        const newCategory = {
            id,
            name,
            icon,
            color: color || getRandomColor()
        };

        setCategories(prev => [newCategory, ...prev]);
        return newCategory;
    };

    const handleUpdateCategory = (updatedCategory) => {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    };

    const handleDeleteCategory = (categoryId) => {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
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

    const handleCreateAccount = (rawName) => {
        const name = (rawName || '').trim();
        if (!name) return null;
        const newAccount = { id: createId(), name };
        setAccounts(prev => [...prev, newAccount]);
        setActiveAccountId(newAccount.id);
        return newAccount;
    };

    const handleRenameAccount = (accountId, rawName) => {
        const name = (rawName || '').trim();
        if (!name) return;
        setAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, name } : acc));
    };

    const handleDeleteAccount = (accountId) => {
        setAccounts(prev => {
            if (prev.length <= 1) {
                // eslint-disable-next-line no-alert
                alert('Minimal harus ada 1 akun aktif.');
                return prev;
            }
            const nextAccounts = prev.filter(acc => acc.id !== accountId);
            if (nextAccounts.length === prev.length) {
                return prev;
            }

            ACCOUNT_DATA_SUFFIXES.forEach(suffix => {
                try {
                    localStorage.removeItem(getAccountScopedKey(accountId, suffix));
                } catch (error) {
                    console.error('Failed to remove account data:', error);
                }
            });

            if (accountId === activeAccountId) {
                const fallback = nextAccounts[0];
                setActiveAccountId(fallback?.id || null);
            }

            return nextAccounts;
        });
    };

    const handleSelectAccount = (accountId) => {
        if (!accountId || accountId === activeAccountId) return;
        const exists = accounts.some(acc => acc.id === accountId);
        if (!exists) return;
        setActiveAccountId(accountId);
    };

    return {
        // State
        accounts,
        activeAccountId,
        wallets,
        transactions,
        categories,
        descriptionHistory,
        contacts,
        // Derived State
        isDataReady,
        walletBalances,
        totalBalance,
        contactBalances,
        totalDebt,
        totalReceivable,
        transactionsWithFullCategory,
        // Handlers
        handleAddTransactions,
        handleEditTransaction,
        handleDeleteTransaction,
        handleAddCategory,
        handleUpdateCategory,
        handleDeleteCategory,
        handleAddWallet,
        handleEditWallet,
        handleDeleteWallet,
        handleCreateAccount,
        handleRenameAccount,
        handleDeleteAccount,
        handleSelectAccount
    }
}
