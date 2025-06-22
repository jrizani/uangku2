import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- Ikon SVG ---
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const ArrowUpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 5l0 14"></path><path d="M18 11l-6 -6l-6 6"></path></svg>);
const ArrowDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M12 5l0 14"></path><path d="M18 13l-6 6l-6 -6"></path></svg>);
const TrashIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><path d="M6 6l12 12"></path></svg>);
const BackspaceIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>);
const TagIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>);
const ChevronDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>);
const WalletIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4Z"/><path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M18 12a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4Z"/></svg>);
const TransferIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16.5 3.5-9 9"/><path d="m10 3 6 6"/><path d="m7.5 10.5 9-9"/><path d="M3 21v-3.5c0-2.2 1.8-4 4-4h13.5"/><path d="m18 16 3 3-3 3"/></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const ArrowLeftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const ArrowRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const ShieldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);

// --- Helper Functions ---
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const getTodayISO = () => new Date().toISOString().split('T')[0];
const createId = () => crypto.randomUUID();
const groupTransactionsByDate = (transactions) => {
  return transactions.reduce((acc, tx) => {
    const date = new Date(tx.date).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {});
};

// --- Security Components ---
function PinScreen({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const storedPin = localStorage.getItem('moneyplus_pin') || '123456';

  const handleKeyPress = (key) => {
    if (pin.length < 6) {
      setPin(pin + key);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === storedPin) {
        onSuccess();
      } else {
        setError('PIN salah, silakan coba lagi.');
        setShaking(true);
        setTimeout(() => {
          setPin('');
          setShaking(false);
        }, 500);
      }
    } else {
      setError('');
    }
  }, [pin, storedPin, onSuccess]);

  const PinKeyButton = ({ children, onClick, className = "" }) => (
      <button onClick={onClick} className={`bg-white/20 backdrop-blur-sm h-16 w-16 flex justify-center items-center text-2xl font-semibold text-white active:bg-white/40 transition-colors rounded-full ${className}`}>
        {children}
      </button>
  );

  return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col justify-center items-center p-4">
        <div className="text-center text-white mb-8">
          <ShieldIcon />
          <h1 className="text-2xl font-bold mt-2">Masukkan PIN</h1>
        </div>
        <div className={`flex space-x-4 mb-4 ${shaking ? 'shake' : ''}`}>
          {[...Array(6)].map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 border-white ${pin.length > i ? 'bg-white' : ''}`}></div>
          ))}
        </div>
        {error && <p className="text-red-300 mb-4">{error}</p>}
        <div className="grid grid-cols-3 gap-6">
          {[...Array(9).keys()].map(i => <PinKeyButton key={i + 1} onClick={() => handleKeyPress((i + 1).toString())}>{i + 1}</PinKeyButton>)}
          <div/>
          <PinKeyButton onClick={() => handleKeyPress('0')}>0</PinKeyButton>
          <PinKeyButton onClick={handleDelete}><BackspaceIcon/></PinKeyButton>
        </div>
      </div>
  );
}

function SettingsModal({ onClose }) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChangePin = () => {
    const storedPin = localStorage.getItem('moneyplus_pin') || '123456';
    if (currentPin !== storedPin) {
      setMessage({ text: 'PIN lama salah.', type: 'error' });
      return;
    }
    if (newPin.length !== 6) {
      setMessage({ text: 'PIN baru harus 6 digit.', type: 'error' });
      return;
    }
    if (newPin !== confirmPin) {
      setMessage({ text: 'Konfirmasi PIN baru tidak cocok.', type: 'error' });
      return;
    }
    localStorage.setItem('moneyplus_pin', newPin);
    setMessage({ text: 'PIN berhasil diubah!', type: 'success' });
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Pengaturan</h2>
            <button onClick={onClose}><CloseIcon /></button>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Ubah PIN Keamanan</h3>
            {message.text && <p className={`p-2 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</p>}
            <input type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)} placeholder="PIN Lama" maxLength="6" className="w-full px-4 py-2 bg-gray-100 border rounded-lg"/>
            <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="PIN Baru (6 digit)" maxLength="6" className="w-full px-4 py-2 bg-gray-100 border rounded-lg"/>
            <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="Konfirmasi PIN Baru" maxLength="6" className="w-full px-4 py-2 bg-gray-100 border rounded-lg"/>
            <button onClick={handleChangePin} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Simpan PIN</button>
          </div>
        </div>
      </div>
  );
}


// --- Main App Component ---
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
        setWallets(JSON.parse(localStorage.getItem('moneyplus_wallets')) || [{ id: createId(), name: 'Dompet Tunai' }]);
        setTransactions(JSON.parse(localStorage.getItem('moneyplus_transactions')) || []);
        const defaultCategories = ['Makanan', 'Transportasi', 'Tagihan', 'Belanja', 'Hiburan', 'Biaya Admin', 'Penyesuaian', 'Utang', 'Piutang', 'Pembayaran Utang', 'Penerimaan Piutang'];
        setCategories(Array.from(new Set([...defaultCategories, ...(JSON.parse(localStorage.getItem('moneyplus_categories')) || [])])));
        setDescriptionHistory(JSON.parse(localStorage.getItem('moneyplus_descriptions')) || []);
        setContacts(JSON.parse(localStorage.getItem('moneyplus_contacts')) || []);
      } catch (error) { console.error("Failed to load data:", error); }
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
    } catch (error) { console.error("Failed to save data:", error); }
  }, [wallets, transactions, categories, descriptionHistory, contacts, isAuthenticated]);

  // --- Business Logic ---
  const { walletBalances, totalBalance, contactBalances, totalDebt, totalReceivable } = useMemo(() => {
    if (!isAuthenticated) return { walletBalances: {}, totalBalance: 0, contactBalances: {}, totalDebt: 0, totalReceivable: 0 };
    const balances = wallets.reduce((acc, wallet) => ({ ...acc, [wallet.id]: 0 }), {});
    const allContacts = new Set(contacts);
    transactions.forEach(tx => { if(tx.contactName) allContacts.add(tx.contactName)});
    const cBalances = Array.from(allContacts).reduce((acc, c) => ({ ...acc, [c]: 0 }), {});

    transactions.forEach(t => {
      if (t.type === 'income') { if (balances[t.walletId] !== undefined) balances[t.walletId] += t.amount; }
      else if (t.type === 'expense') { if (balances[t.walletId] !== undefined) balances[t.walletId] -= t.amount; }
      else if (t.type === 'transfer') {
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

    return { walletBalances: balances, totalBalance: Object.values(balances).reduce((s, b) => s + b, 0), contactBalances: cBalances, totalDebt, totalReceivable };
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

  const handleDeleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id));
  const handleAddCategory = (newCategory) => { if (newCategory && !categories.includes(newCategory)) { setCategories(prev => [newCategory, ...prev]); return true; } return false; };
  const handleAddWallet = (name, initialBalance) => {
    const newWallet = { id: createId(), name };
    setWallets(prev => [...prev, newWallet]);
    if (initialBalance > 0) handleAddTransactions({ id: createId(), amount: initialBalance, text: 'Saldo Awal', category: 'Penyesuaian', type: 'income', walletId: newWallet.id, date: new Date().toISOString() });
  };
  const handleEditWallet = (id, newName, newBalance) => {
    const currentBalance = walletBalances[id] || 0;
    const difference = Number(newBalance) - currentBalance;
    if (difference !== 0) handleAddTransactions({ id: createId(), amount: Math.abs(difference), text: 'Penyesuaian Saldo', category: 'Penyesuaian', type: difference > 0 ? 'income' : 'expense', walletId: id, date: new Date().toISOString() });
    setWallets(prev => prev.map(w => w.id === id ? {...w, name: newName} : w));
  };
  const handleDeleteWallet = (id) => setWallets(prev => prev.filter(w => w.id !== id));

  // --- View Navigation ---
  const navigateTo = (view, id = null) => { setSelectedId(id); setCurrentView(view); }

  if (!isAuthenticated) {
    return <PinScreen onSuccess={handleLoginSuccess} />;
  }

  const views = {
    dashboard: <DashboardView wallets={wallets} walletBalances={walletBalances} totalBalance={totalBalance} transactions={transactions} onDeleteTransaction={handleDeleteTransaction} onSelectWallet={(id) => navigateTo('walletDetail', id)} onOpenWalletSettings={() => setIsWalletModalOpen(true)} onOpenDebtDashboard={() => navigateTo('debtDashboard')} totalDebt={totalDebt} totalReceivable={totalReceivable} onOpenSettings={() => setIsSettingsModalOpen(true)} />,
    walletDetail: <WalletDetailView walletId={selectedId} wallets={wallets} transactions={transactions} walletBalances={walletBalances} onDeleteTransaction={handleDeleteTransaction} onBack={() => navigateTo('dashboard')} />,
    debtDashboard: <DebtDashboardView contactBalances={contactBalances} onSelectContact={(name) => navigateTo('debtContactDetail', name)} onBack={() => navigateTo('dashboard')}/>,
    debtContactDetail: <DebtContactDetailView contactName={selectedId} transactions={transactions} wallets={wallets} contactBalances={contactBalances} onDeleteTransaction={handleDeleteTransaction} onBack={() => navigateTo('debtDashboard')} />
  };

  return (
      <div className="bg-gray-100 min-h-screen font-sans antialiased text-gray-800">
        {views[currentView]}
        <div className="fixed bottom-6 right-6 z-40"><button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white rounded-full p-4 shadow-lg"><PlusIcon /></button></div>
        {isModalOpen && <AddTransactionModal onClose={() => setIsModalOpen(false)} onAddTransactions={handleAddTransactions} wallets={wallets} categories={categories} onAddCategory={handleAddCategory} descriptionHistory={descriptionHistory} contacts={contacts} contactBalances={contactBalances} />}
        {isWalletModalOpen && <WalletManagementModal onClose={() => setIsWalletModalOpen(false)} wallets={wallets} walletBalances={walletBalances} transactions={transactions} onAdd={handleAddWallet} onEdit={handleEditWallet} onDelete={handleDeleteWallet}/>}
        {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
        <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } @keyframes keypad-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-keypad-up { animation: keypad-up 0.2s ease-out forwards; } .shake { animation: shake 0.5s; } @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }`}</style>
      </div>
  );
}

// --- View Components ---
function DashboardView({ wallets, walletBalances, totalBalance, transactions, onDeleteTransaction, onSelectWallet, onOpenWalletSettings, onOpenDebtDashboard, totalDebt, totalReceivable, onOpenSettings }) {
  return (<div className="container mx-auto max-w-lg p-4 pb-24"><header className="flex justify-between items-center my-6"><h1 className="text-3xl font-bold">uangku</h1><button onClick={onOpenSettings} className="text-gray-600 p-2"><SettingsIcon /></button></header><div className="bg-white rounded-xl shadow-md p-5 mb-6 text-center"><p className="text-sm uppercase">Total Saldo</p><p className={`text-4xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalBalance)}</p></div><div className="mb-6 bg-white rounded-xl shadow-md p-5 cursor-pointer" onClick={onOpenDebtDashboard}><div className="flex items-center justify-between mb-2"><h2 className="text-xl font-bold">Utang Piutang</h2><UsersIcon /></div><div className="flex justify-around"><div className="text-center"><p className="text-sm uppercase text-red-500">Utang Saya</p><p className="font-bold text-lg text-red-600">{formatCurrency(Math.abs(totalDebt))}</p></div><div className="text-center"><p className="text-sm uppercase text-green-500">Piutang</p><p className="font-bold text-lg text-green-600">{formatCurrency(totalReceivable)}</p></div></div></div><div className="mb-6"><div className="flex justify-between items-center mb-2"><h2 className="text-xl font-bold">Daftar Dompet</h2><button onClick={onOpenWalletSettings} className="text-blue-600 p-2"><EditIcon/></button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{wallets.map(wallet => (<div key={wallet.id} onClick={() => onSelectWallet(wallet.id)} className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-3 cursor-pointer"><div className="p-2 bg-blue-100 rounded-full"><WalletIcon/></div><div><p className="font-semibold">{wallet.name}</p><p className="font-bold text-blue-600">{formatCurrency(walletBalances[wallet.id] || 0)}</p></div></div>))}</div></div><TransactionList transactions={transactions} wallets={wallets} onDeleteTransaction={onDeleteTransaction} /></div>);
}

function WalletDetailView({ walletId, wallets, transactions, walletBalances, onDeleteTransaction, onBack }) {
  const wallet = wallets.find(w => w.id === walletId);
  const relevantTransactions = useMemo(() => transactions.filter(tx => tx.walletId === walletId || tx.fromWalletId === walletId || tx.toWalletId === walletId), [transactions, walletId]);
  if (!wallet) return <div className="p-10 text-center">Dompet tidak ditemukan. <button onClick={onBack}>Kembali</button></div>;
  return (<div className="bg-gray-100 min-h-screen"><div className="container mx-auto max-w-lg p-4 pb-24"><header className="flex items-center my-6"><button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon/></button><h1 className="text-2xl font-bold">{wallet.name}</h1></header><div className="bg-white rounded-xl shadow-md p-5 mb-6 text-center"><p className="text-sm uppercase">Saldo Saat Ini</p><p className={`text-4xl font-bold ${walletBalances[wallet.id] >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(walletBalances[wallet.id] || 0)}</p></div><TransactionList transactions={relevantTransactions} wallets={wallets} onDeleteTransaction={onDeleteTransaction} /></div></div>);
}

function DebtDashboardView({ contactBalances, onSelectContact, onBack }) {
  const sortedContacts = useMemo(() => Object.entries(contactBalances).sort(([, a], [, b]) => a - b), [contactBalances]);
  return (<div className="bg-gray-100 min-h-screen"><div className="container mx-auto max-w-lg p-4 pb-24"><header className="flex items-center my-6"><button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon/></button><h1 className="text-2xl font-bold">Utang Piutang</h1></header><div className="space-y-3">{sortedContacts.map(([name, balance]) => (balance !== 0 && <div key={name} onClick={() => onSelectContact(name)} className="bg-white rounded-lg p-4 flex justify-between items-center cursor-pointer"><p className="font-bold">{name}</p><div className="text-right"><p className={`font-bold ${balance > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(balance)}</p><p className="text-xs text-gray-500">{balance > 0 ? 'Dia berhutang' : 'Saya berhutang'}</p></div></div>))}<div className="text-center text-gray-500 pt-10">{sortedContacts.every(([,b]) => b===0) && 'Tidak ada utang piutang yang aktif.'}</div></div></div></div>)
}

function DebtContactDetailView({ contactName, transactions, wallets, contactBalances, onDeleteTransaction, onBack }) {
  const relevantTransactions = useMemo(() => transactions.filter(tx => tx.contactName === contactName), [transactions, contactName]);
  const balance = contactBalances[contactName] || 0;
  return (<div className="bg-gray-100 min-h-screen"><div className="container mx-auto max-w-lg p-4 pb-24"><header className="flex items-center my-6"><button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon/></button><h1 className="text-2xl font-bold">Riwayat dengan {contactName}</h1></header><div className="bg-white rounded-xl shadow-md p-5 mb-6 text-center"><p className="text-sm uppercase">{balance > 0 ? 'Dia berhutang pada Anda' : balance < 0 ? 'Anda berhutang padanya' : 'Lunas'}</p><p className={`text-4xl font-bold ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>{formatCurrency(Math.abs(balance))}</p></div><TransactionList transactions={relevantTransactions} wallets={wallets} onDeleteTransaction={onDeleteTransaction} /></div></div>)
}


function TransactionList({ transactions, wallets, onDeleteTransaction }) {
  const groupedTransactions = useMemo(() => groupTransactionsByDate(transactions), [transactions]);
  const sortedDates = useMemo(() => Object.keys(groupedTransactions).sort((a,b) => new Date(b) - new Date(a)), [groupedTransactions]);
  if (transactions.length === 0) return <div className="text-center py-10 bg-white rounded-lg shadow-sm"><p className="text-gray-500">Tidak ada transaksi.</p></div>
  return (<div className="space-y-4"><h2 className="text-xl font-bold text-gray-600">Riwayat Transaksi</h2>{sortedDates.map(date => (<div key={date}><h3 className="text-sm font-semibold text-gray-500 bg-gray-100 p-2 rounded sticky top-0">{new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3><div className="space-y-2 mt-1">{groupedTransactions[date].map(tx => (<TransactionItem key={tx.id} transaction={tx} onDelete={onDeleteTransaction} wallets={wallets} />))}</div></div>))}</div>);
}

function TransactionItem({ transaction, onDelete, wallets }) {
  const { text, amount, type, category } = transaction;
  let color, sign, icon;
  if (type === 'transfer') { color = 'text-gray-500'; sign = ''; icon = <TransferIcon />;
  } else {
    color = type === 'income' ? 'text-green-500' : 'text-red-500';
    sign = type === 'income' ? '+' : '-';
    icon = type === 'income' ? <ArrowUpIcon /> : <ArrowDownIcon />;
  }
  return (<div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"><div className="flex items-center space-x-4 min-w-0"><div className={`p-2 rounded-full flex-shrink-0 ${type === 'income' ? 'bg-green-100' : type === 'expense' ? 'bg-red-100' : 'bg-gray-100'}`}>{icon}</div><div className="min-w-0"><p className="font-semibold capitalize truncate">{text}</p><div className="flex items-center space-x-2 text-gray-500"><div className="flex items-center space-x-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full"><TagIcon /><span>{category}</span></div></div></div></div><div className="flex items-center space-x-3 flex-shrink-0"><p className={`font-bold text-right ${color}`}>{sign} {formatCurrency(amount)}</p><button onClick={() => onDelete(transaction.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button></div></div>);
}

const NumericKeypad = ({ onKeyPress, onDelete, onHide, displayValue }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '000'];
  const KeyButton = ({ children, onClick, className = "" }) => (<button onClick={onClick} className={`bg-white/50 backdrop-blur-sm h-14 flex justify-center items-center text-2xl font-medium text-gray-800 active:bg-gray-300 transition-colors rounded-md ${className}`}>{children}</button>);
  return (
      <div onClick={(e) => e.stopPropagation()} className="fixed bottom-0 left-0 right-0 bg-gray-200/80 p-2 z-[60] shadow-lg animate-keypad-up">
        <div className="max-w-lg mx-auto text-right px-2 pb-2">
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(displayValue || 0)}</p>
        </div>
        <div className="grid grid-cols-3 grid-rows-4 gap-2 max-w-lg mx-auto">
          {keys.map(key => <KeyButton key={key} onClick={() => onKeyPress(key)}>{key}</KeyButton>)}
          <KeyButton onClick={onDelete}><BackspaceIcon /></KeyButton>
        </div>
        <div className="max-w-lg mx-auto mt-2">
          <button onClick={onHide} className="w-full h-12 bg-gray-300/80 text-gray-700 font-bold rounded-lg flex justify-center items-center"><ChevronDownIcon /></button>
        </div>
      </div>
  );
};

function AddTransactionModal({ onClose, onAddTransactions, wallets, categories, onAddCategory, descriptionHistory, contacts, contactBalances }) {
  const [activeTab, setActiveTab] = useState('expense');
  const [form, setForm] = useState({ text: '', amount: '', adminFee: '', type: 'expense', category: '', walletId: wallets[0]?.id || '', fromWalletId: wallets[0]?.id || '', toWalletId: wallets[1]?.id || '', date: getTodayISO(), contactName: '', debtAction: 'new_piutang', debtMode: 'new'});
  const [error, setError] = useState('');
  const [isKeypadVisible, setIsKeypadVisible] = useState(false);
  const [keypadTarget, setKeypadTarget] = useState('amount');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleInputChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSubmit = () => {
    const { text, amount, adminFee, type, category, walletId, fromWalletId, toWalletId, date, contactName, debtMode, debtAction } = form;
    if (!amount || +amount === 0) {setError('Jumlah tidak boleh kosong.'); return;}

    let txs = [];
    const txDate = new Date(date + 'T00:00:00').toISOString();
    const adminFeeNum = Number(adminFee) || 0;

    if (type === 'debt') {
      if (!contactName) {setError('Nama kontak harus diisi.'); return;}
      if (debtMode === 'new') {
        const isPiutang = debtAction === 'new_piutang';
        const cat = isPiutang ? 'Piutang' : 'Utang';
        const txType = isPiutang ? 'expense' : 'income';
        txs.push({ id: createId(), amount: +amount, type: txType, text: `${cat} ${isPiutang ? 'ke' : 'dari'} ${contactName}`, category: cat, walletId, date: txDate, contactName });
      } else {
        const balance = contactBalances[contactName] || 0;
        if (balance === 0) { setError('Kontak ini tidak memiliki utang/piutang aktif.'); return;}
        const isPayingMyDebt = balance < 0;
        const cat = isPayingMyDebt ? 'Pembayaran Utang' : 'Penerimaan Piutang';
        const txType = isPayingMyDebt ? 'expense' : 'income';
        txs.push({ id: createId(), amount: +amount, type: txType, text: `${cat} ${isPayingMyDebt ? 'ke' : 'dari'} ${contactName}`, category: cat, walletId, date: txDate, contactName });
      }
    } else if (type === 'transfer') {
      if (fromWalletId === toWalletId) {setError('Dompet asal dan tujuan tidak boleh sama.'); return;}
      txs.push({ id: createId(), amount: +amount, type, text: `Transfer ke ${wallets.find(w=>w.id===toWalletId)?.name}`, fromWalletId, toWalletId, category: 'Transfer', date: txDate });
      if (adminFeeNum > 0) txs.push({ id: createId(), amount: adminFeeNum, type: 'expense', text: 'Biaya Admin Transfer', walletId: fromWalletId, category: 'Biaya Admin', date: txDate });
    } else {
      if (!text.trim()) { setError('Deskripsi harus diisi.'); return; }
      if (!category) { setError('Kategori harus dipilih.'); return; }
      const totalAmount = type === 'expense' ? (+amount + adminFeeNum) : +amount;
      const updatedText = type === 'expense' && adminFeeNum > 0 ? `${text} (+ Biaya Admin)` : text;
      txs.push({ id: createId(), amount: totalAmount, type, text: updatedText, category, walletId, date: txDate });
    }

    onAddTransactions(txs);
  };

  const TabButton = ({ tabName, label }) => (<button onClick={() => { setActiveTab(tabName); handleInputChange('type', tabName); setIsKeypadVisible(false); }} className={`w-full p-2 text-center font-semibold border-b-4 ${activeTab === tabName ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>{label}</button>);

  const debtOptions = [{id: 'new', name: 'Buat Baru'}, {id: 'payment', name: 'Bayar / Terima Cicilan'}];
  const newDebtOptions = [{id: 'new_piutang', name: 'Memberi Pinjaman'}, {id: 'new_utang', name: 'Membuat Utang'}];

  return (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-end" onClick={onClose}><div className="bg-white rounded-t-2xl shadow-2xl w-full max-w-lg mx-auto relative animate-fade-in-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}><div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Transaksi Baru</h2><button onClick={onClose}><CloseIcon /></button></div><div className="flex border-b"><TabButton tabName="expense" label="Pengeluaran" /><TabButton tabName="income" label="Pemasukan" /><TabButton tabName="transfer" label="Transfer" /><TabButton tabName="debt" label="Utang/Piutang" /></div><div className="p-6 space-y-4 overflow-y-auto">{error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-sm" onClick={() => setError('')}>{error}</p>}
    <div className="flex gap-4"><div className="flex-grow"><label className="block text-sm font-medium mb-1">Jumlah</label><input type="text" readOnly value={formatCurrency(form.amount || 0)} onFocus={() => { setIsKeypadVisible(true); setKeypadTarget('amount'); }} className="w-full p-3 bg-gray-50 rounded-lg text-right text-2xl font-bold cursor-pointer"/></div>{(activeTab === 'expense' || activeTab === 'transfer') && <div className="w-1/3"><label className="block text-sm font-medium mb-1">Biaya Admin</label><input type="text" readOnly value={formatCurrency(form.adminFee || 0)} onFocus={() => { setIsKeypadVisible(true); setKeypadTarget('adminFee'); }} className="w-full p-3 bg-gray-50 rounded-lg text-right text-xl font-bold cursor-pointer"/></div>}</div>
    {activeTab === 'transfer' ? (<div className="grid grid-cols-2 gap-4"><SearchableWalletSelector label="Dari Dompet" wallets={wallets} selectedId={form.fromWalletId} onSelect={val => handleInputChange('fromWalletId', val)} onFocus={() => setIsKeypadVisible(false)} /><SearchableWalletSelector label="Ke Dompet" wallets={wallets.filter(w => w.id !== form.fromWalletId)} selectedId={form.toWalletId} onSelect={val => handleInputChange('toWalletId', val)} onFocus={() => setIsKeypadVisible(false)} /></div>)
        : activeTab === 'debt' ? (<><CustomSelect label="Mode" options={debtOptions} selectedId={form.debtMode} onSelect={val => handleInputChange('debtMode', val)} onFocus={() => setIsKeypadVisible(false)}/> {form.debtMode === 'new' && <CustomSelect label="Jenis Transaksi" options={newDebtOptions} selectedId={form.debtAction} onSelect={val => handleInputChange('debtAction', val)} onFocus={() => setIsKeypadVisible(false)}/>}<AutocompleteInput value={form.contactName} onChange={val => handleInputChange('contactName', val)} suggestions={contacts} onFocus={() => setIsKeypadVisible(false)} label="Nama Kontak"/><SearchableWalletSelector label="Pilih Dompet" wallets={wallets} selectedId={form.walletId} onSelect={val => handleInputChange('walletId', val)} onFocus={() => setIsKeypadVisible(false)} /></>)
            : (<><SearchableWalletSelector label="Dompet" wallets={wallets} selectedId={form.walletId} onSelect={val => handleInputChange('walletId', val)} onFocus={() => setIsKeypadVisible(false)} /><AutocompleteInput value={form.text} onChange={val => handleInputChange('text', val)} suggestions={descriptionHistory} onFocus={() => setIsKeypadVisible(false)} /><SearchableCategorySelector categories={categories.filter(c => !['Utang','Piutang','Pembayaran Utang','Penerimaan Piutang'].includes(c))} selected={form.category} onSelect={val => handleInputChange('category', val)} onAddCategory={onAddCategory} onFocus={() => setIsKeypadVisible(false)} /></>)}
    <div className="relative"><label className="block text-sm font-medium text-gray-600 mb-1">Tanggal</label><button type="button" onClick={() => setIsDatePickerOpen(prev => !prev)} className="w-full text-left px-4 py-3 bg-gray-50 border rounded-lg cursor-pointer flex justify-between items-center"><span>{new Date(form.date+'T00:00:00').toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span><CalendarIcon /></button></div>
    <div className="pt-2"><button onClick={handleSubmit} className="w-full h-14 bg-blue-600 text-white text-xl font-bold rounded-lg">Simpan</button></div></div>{isDatePickerOpen && <DatePickerDialog selectedDate={form.date} onSelectDate={(d) => {handleInputChange('date', d); setIsDatePickerOpen(false);}} onClose={() => setIsDatePickerOpen(false)}/>}</div>{isKeypadVisible && <NumericKeypad displayValue={form[keypadTarget]} onKeyPress={key => handleInputChange(keypadTarget, (form[keypadTarget] + key).replace(/^0+/, ''))} onDelete={() => handleInputChange(keypadTarget, form[keypadTarget].slice(0, -1))} onHide={() => setIsKeypadVisible(false)} />}</div>);
}

function WalletManagementModal({ onClose, wallets, walletBalances, transactions, onAdd, onEdit, onDelete }) {
  const [newWalletName, setNewWalletName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [editingWallet, setEditingWallet] = useState(null);

  const handleAdd = () => { if (newWalletName.trim()) { onAdd(newWalletName.trim(), Number(initialBalance) || 0); setNewWalletName(''); setInitialBalance(''); } };
  const handleEdit = () => { if(editingWallet && editingWallet.name.trim()){ onEdit(editingWallet.id, editingWallet.name.trim(), editingWallet.balance); setEditingWallet(null); } };
  const handleDeleteWithConfirm = (wallet) => { const balance = walletBalances[wallet.id] || 0; let message = `Apakah Anda yakin ingin menghapus dompet "${wallet.name}"?`; if (balance !== 0) { message += `\n\nPERINGATAN: Dompet ini masih memiliki saldo ${formatCurrency(balance)}. Saldo akan hilang.`; } if (window.confirm(message)) { onDelete(wallet.id); } };
  const isWalletInUse = (walletId) => transactions.some(t => t.walletId === walletId || t.fromWalletId === walletId || t.toWalletId === walletId);

  return (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}><div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 relative animate-fade-in-up" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Manajemen Dompet</h2><button onClick={onClose}><CloseIcon /></button></div><div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">{wallets.map(wallet => (<div key={wallet.id} className="bg-gray-50 p-3 rounded-lg">{editingWallet?.id === wallet.id ? (<div className="space-y-2"><input type="text" value={editingWallet.name} onChange={e => setEditingWallet({...editingWallet, name: e.target.value})} placeholder="Nama Dompet" className="w-full font-semibold border-b-2 p-1"/> <input type="number" value={editingWallet.balance} onChange={e => setEditingWallet({...editingWallet, balance: e.target.value})} placeholder="Saldo Baru" className="w-full font-semibold border-b-2 p-1"/><div className="flex justify-end space-x-2 pt-2"><button onClick={() => setEditingWallet(null)} className="text-sm">Batal</button><button onClick={handleEdit} className="text-sm font-bold text-blue-600">Simpan</button></div></div>) : (<div className="flex items-center justify-between"><p className="font-semibold">{wallet.name}</p><div className="flex items-center space-x-2"><button onClick={() => setEditingWallet({id: wallet.id, name: wallet.name, balance: walletBalances[wallet.id] || 0})} className="text-blue-600"><EditIcon/></button><button onClick={() => handleDeleteWithConfirm(wallet)} disabled={isWalletInUse(wallet.id)} className="disabled:text-gray-300 text-red-500"><TrashIcon className={isWalletInUse(wallet.id) ? "text-gray-300" : ""}/></button></div></div>)}</div>))}</div><div className="mt-6 border-t pt-4"><h3 className="font-bold mb-2">Tambah Dompet Baru</h3><div className="flex space-x-2"><input type="text" value={newWalletName} onChange={e => setNewWalletName(e.target.value)} placeholder="Nama dompet" className="flex-grow w-full px-4 py-2 bg-gray-100 border rounded-lg"/><input type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} placeholder="Saldo awal (opsional)" className="w-40 px-4 py-2 bg-gray-100 border rounded-lg"/></div><button onClick={handleAdd} className="mt-2 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Tambah Dompet</button></div></div></div>);
}

const AutocompleteInput = React.forwardRef(({ value, onChange, suggestions, onFocus, label = "Deskripsi" }, ref) => {
  const [filtered, setFiltered] = useState([]); const [showSuggestions, setShowSuggestions] = useState(false);
  const handleChange = (e) => { const input = e.target.value; onChange(input); if (input) { setFiltered(suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase())).slice(0, 5)); setShowSuggestions(true); } else { setShowSuggestions(false); } };
  const onSuggestionClick = (suggestion) => { onChange(suggestion); setShowSuggestions(false); };
  return (<div className="relative"><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><input ref={ref} type="text" value={value} onChange={handleChange} onFocus={onFocus} placeholder={`Tulis ${label.toLowerCase()}...`} className="w-full px-4 py-3 bg-gray-50 border rounded-lg"/>{showSuggestions && filtered.length > 0 && (<ul className="absolute z-20 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">{filtered.map((s, i) => <li key={i} onClick={() => onSuggestionClick(s)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{s}</li>)}</ul>)}</div>);
});

const DatePickerDialog = ({ selectedDate, onSelectDate, onClose }) => {
  const [displayDate, setDisplayDate] = useState(new Date(selectedDate + 'T00:00:00'));
  const wrapperRef = useRef(null);

  const changeMonth = (amount) => setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));

  const days = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const selected = new Date(selectedDate + 'T00:00:00');

    let daysArray = [];
    for (let i = 0; i < firstDay; i++) daysArray.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      daysArray.push({ date: i, isToday: d.toDateString() === today.toDateString(), isSelected: d.toDateString() === selected.toDateString(), });
    }
    return daysArray;
  }, [displayDate, selectedDate]);

  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div ref={wrapperRef} className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm" onClick={e=>e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeftIcon /></button>
            <p className="font-bold text-lg">{displayDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ArrowRightIcon /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map(day => <div key={day} className="font-semibold text-sm text-gray-500">{day}</div>)}
            {days.map((day, index) => (
                day ? <button key={index} onClick={() => onSelectDate(new Date(displayDate.getFullYear(), displayDate.getMonth(), day.date).toISOString().split('T')[0])} className={`p-2 rounded-full transition-colors ${day.isSelected ? 'bg-blue-600 text-white' : day.isToday ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>{day.date}</button> : <div key={index}></div>
            ))}
          </div>
        </div>
      </div>
  );
};

const CustomSelect = ({ label, options, selectedId, onSelect, onFocus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selectedItem = options.find(item => item.id === selectedId);

  useEffect(() => {
    function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (item) => { onSelect(item.id); setIsOpen(false); };

  return (<div className="relative" ref={wrapperRef}><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><button type="button" onClick={() => setIsOpen(prev => !prev)} onFocus={onFocus} className="w-full text-left px-4 py-3 bg-gray-50 border rounded-lg cursor-pointer flex justify-between items-center"><span>{selectedItem?.name || `Pilih ${label.toLowerCase()}`}</span><ChevronDownIcon /></button>{isOpen && (<div className="absolute z-20 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto"><ul>{options.map(item => <li key={item.id} onClick={() => handleSelect(item)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{item.name}</li>)}</ul></div>)}</div>);
}

const SearchableDropdown = ({ label, items, selectedId, onSelect, onFocus, placeholder, onAddNew, canAddNew = false }) => {
  const [searchTerm, setSearchTerm] = useState(''); const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null); const selectedItem = items.find(item => item.id === selectedId);
  useEffect(() => { function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); } document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, [wrapperRef]);
  const filteredItems = searchTerm ? items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())) : items;
  const handleSelect = (item) => { onSelect(item.id); setSearchTerm(''); setIsOpen(false); };
  const handleAddNewClick = () => { if(searchTerm) { onAddNew(searchTerm); handleSelect({id: searchTerm, name: searchTerm}); } }

  return (<div className="relative" ref={wrapperRef}><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><input type="text" value={isOpen ? searchTerm : selectedItem?.name || ''} onChange={e => { setSearchTerm(e.target.value); if(selectedItem) onSelect(null); }} onFocus={() => { setIsOpen(true); onFocus(); }} placeholder={placeholder} className="w-full px-4 py-3 bg-gray-50 border rounded-lg cursor-pointer"/>{isOpen && (<div className="absolute z-20 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto"><ul>{filteredItems.map(item => <li key={item.id} onClick={() => handleSelect(item)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{item.name}</li>)}</ul>{canAddNew && searchTerm && !filteredItems.some(i => i.name.toLowerCase() === searchTerm.toLowerCase()) && (<div className="p-2 border-t"><button onClick={handleAddNewClick} className="w-full text-left px-2 py-1 text-blue-600">Tambah: "{searchTerm}"</button></div>)}</div>)}</div>);
}

const SearchableWalletSelector = (props) => <SearchableDropdown {...props} items={props.wallets} placeholder="Pilih dompet"/>
const SearchableCategorySelector = ({ categories, selected, onSelect, onAddCategory, onFocus }) => {
  const items = useMemo(() => categories.map(c => ({id: c, name: c})), [categories]);
  return <SearchableDropdown label="Kategori" items={items} selectedId={selected} onSelect={onSelect} onFocus={onFocus} placeholder="Pilih atau cari kategori" onAddNew={onAddCategory} canAddNew={true}/>;
};
