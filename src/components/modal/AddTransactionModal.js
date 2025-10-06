import React, {useEffect, useMemo, useState} from "react";
import {createId, formatCurrency, getTodayISO} from "../../utils/helpers";
import {CalendarIcon, CloseIcon} from "../../utils/icons";
import {SearchableWalletSelector} from "../widget/SearchableWalletSelector";
import {CustomSelect} from "../widget/CustomSelect";
import {AutocompleteInput} from "../widget/AutoComplete";
import {SearchableCategorySelector} from "../widget/SearchableCategorySelector";
import {DatePickerDialog} from "../widget/DatePickerDialog";
import {NumericKeypad} from "../widget/NumericKeypad";
import {useApp} from "../../context/AppContext";

export function AddTransactionModal({
                                        onClose,
                                        onAddTransactions,
                                        onEditTransaction,
                                        transactionToEdit,
                                    }) {
    const {
        wallets,
        categories,
        descriptionHistory,
        contacts,
        contactBalances,
        onAddCategory,
        walletBalances // <-- Ambil saldo dompet dari sini
    } = useApp();
    const isEditMode = transactionToEdit != null;
    const [activeTab, setActiveTab] = useState('expense');
    const [form, setForm] = useState({
        text: '',
        amount: '',
        adminFee: '',
        type: 'expense',
        category: '',
        walletId: wallets[0]?.id || '',
        fromWalletId: wallets[0]?.id || '',
        toWalletId: wallets[1]?.id || '',
        date: getTodayISO(),
        contactName: '',
        debtAction: 'new_piutang',
        debtMode: 'new',
        useBorrowedForExpense: false,
        expenseCategory: '',
        expenseText: '',
        expenseWalletId: wallets[0]?.id || ''
    });
    const [error, setError] = useState('');
    const [isKeypadVisible, setIsKeypadVisible] = useState(false);
    const [keypadTarget, setKeypadTarget] = useState('amount');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            const tx = transactionToEdit;
            setActiveTab(tx.type);
            setForm({
                text: tx.text || '',
                amount: tx.amount.toString(),
                adminFee: '',
                type: tx.type,
                category: tx.category || '',
                walletId: tx.walletId || wallets[0]?.id,
                fromWalletId: tx.fromWalletId || wallets[0]?.id,
                toWalletId: tx.toWalletId || (wallets[1] ? wallets[1].id : ''),
                date: new Date(tx.date).toISOString().split('T')[0],
                contactName: tx.contactName || '',
                debtAction: 'new_piutang',
                debtMode: 'new',
                useBorrowedForExpense: false,
                expenseCategory: '',
                expenseText: '',
                expenseWalletId: tx.walletId || wallets[0]?.id || ''
            });
        }
    }, [transactionToEdit, isEditMode, wallets]);

    const selectableCategories = useMemo(() => {
        const excluded = ['Utang', 'Piutang', 'Pembayaran Utang', 'Penerimaan Piutang'];
        return categories.filter(cat => !excluded.includes(cat?.name || cat));
    }, [categories]);

    const handleInputChange = (field, value) => setForm(prev => ({...prev, [field]: value}));
    const handleSubmit = () => {
        const {
            text,
            amount,
            adminFee,
            type,
            category,
            walletId,
            fromWalletId,
            toWalletId,
            date,
            contactName,
            debtMode,
            debtAction,
            useBorrowedForExpense,
            expenseCategory,
            expenseText,
            expenseWalletId
        } = form;
        if (!amount || +amount === 0) {
            setError('Jumlah tidak boleh kosong.');
            return;
        }

        const checkWalletBalance = (walletId, amountToSpend) => {
            // Hanya periksa jika ada jumlah positif yang akan dibelanjakan
            if (!walletId || amountToSpend <= 0) return true;
            const balance = walletBalances[walletId] || 0; // <-- Gunakan saldo dari context
            const wallet = wallets.find(w => w.id === walletId); // <-- Cari nama dompet untuk pesan
            if (wallet && balance < amountToSpend) {
                return window.confirm(
                    `Saldo dompet "${wallet.name}" tidak mencukupi (Saldo: ${formatCurrency(balance)}, Pengeluaran: ${formatCurrency(amountToSpend)}). Tetap lanjutkan?`
                );
            }
            return true;
        };
        const txDate = new Date(date).toISOString();

        if (isEditMode) {
            if (transactionToEdit.type === 'debt' || transactionToEdit.category.includes('Utang') || transactionToEdit.category.includes('Piutang')) {
                setError('Mengedit transaksi utang/piutang belum didukung.');
                return;
            }

            const oldTx = transactionToEdit;
            const newAmount = +amount;

            // Lakukan pengecekan saldo untuk transaksi keluar di mode edit
            if (type === 'expense') {
                const isSameWallet = oldTx.walletId === walletId;
                // Hanya periksa selisihnya jika jumlahnya meningkat di dompet yang sama
                const amountToVerify = isSameWallet ? newAmount - oldTx.amount : newAmount;
                if (!checkWalletBalance(walletId, amountToVerify)) return;
            } else if (type === 'transfer') {
                const isSameWallet = oldTx.fromWalletId === fromWalletId;
                // Hanya periksa selisihnya jika jumlahnya meningkat dari dompet yang sama
                const amountToVerify = isSameWallet ? newAmount - oldTx.amount : newAmount;
                if (!checkWalletBalance(fromWalletId, amountToVerify)) return;
            }

            let updatedTx = {...oldTx, amount: newAmount, date: txDate};

            if (type === 'transfer') {
                if (fromWalletId === toWalletId) {
                    setError('Dompet asal dan tujuan tidak boleh sama.');
                    return;
                }
                updatedTx = {
                    ...updatedTx,
                    fromWalletId,
                    toWalletId,
                    text: `Transfer ke ${wallets.find(w => w.id === toWalletId)?.name}`,
                    category: 'Transfer'
                };
            } else { // 'expense' atau 'income'
                if (!text.trim()) {
                    setError('Deskripsi harus diisi.');
                    return;
                }
                updatedTx = {...updatedTx, text, category, walletId};
            }
            onEditTransaction(updatedTx);

        } else {
            const amountNum = +amount;
            const adminFeeNum = Number(adminFee) || 0;

            if (type === 'expense') {
                if (!checkWalletBalance(walletId, amountNum + adminFeeNum)) return;
            } else if (type === 'transfer') {
                if (!checkWalletBalance(fromWalletId, amountNum + adminFeeNum)) return;
            } else if (type === 'debt') {
                if (debtMode === 'new' && debtAction === 'new_piutang') { // Memberi pinjaman (expense)
                    if (!checkWalletBalance(walletId, amountNum)) return;
                } else if (debtMode === 'payment') {
                    const balance = contactBalances[contactName] || 0;
                    if (balance < 0) { // Bayar utang kita (expense)
                        if (!checkWalletBalance(walletId, amountNum)) return;
                    }
                }
            }

            let txs = [];

            if (type === 'debt') {
                if (!contactName) {
                    setError('Nama kontak harus diisi.');
                    return;
                }
                if (debtMode === 'new') {
                    const isPiutang = debtAction === 'new_piutang';
                    const cat = isPiutang ? 'Piutang' : 'Utang';
                    const txType = isPiutang ? 'expense' : 'income';
                    txs.push({
                        id: createId(),
                        amount: +amount,
                        type: txType,
                        text: `${cat} ${isPiutang ? 'ke' : 'dari'} ${contactName}`,
                        category: cat,
                        walletId,
                        date: txDate,
                        contactName
                    });

                    if (!isPiutang && useBorrowedForExpense) {
                        if (!expenseText.trim()) {
                            setError('Deskripsi pengeluaran dari utang harus diisi.');
                            return;
                        }
                        if (!expenseCategory) {
                            setError('Kategori pengeluaran dari utang harus dipilih.');
                            return;
                        }
                        const walletForExpense = expenseWalletId || walletId;
                        txs.push({
                            id: createId(),
                            amount: +amount,
                            type: 'expense',
                            text: expenseText.trim(),
                            category: expenseCategory,
                            walletId: walletForExpense,
                            date: txDate,
                            contactName
                        });
                    }
                } else {
                    const balance = contactBalances[contactName] || 0;
                    if (balance === 0) {
                        setError('Kontak ini tidak memiliki utang/piutang aktif.');
                        return;
                    }
                    const isPayingMyDebt = balance < 0;
                    const cat = isPayingMyDebt ? 'Pembayaran Utang' : 'Penerimaan Piutang';
                    const txType = isPayingMyDebt ? 'expense' : 'income';
                    txs.push({
                        id: createId(),
                        amount: +amount,
                        type: txType,
                        text: `${cat} ${isPayingMyDebt ? 'ke' : 'dari'} ${contactName}`,
                        category: cat,
                        walletId,
                        date: txDate,
                        contactName
                    });
                }
            } else if (type === 'transfer') {
                if (fromWalletId === toWalletId) {
                    setError('Dompet asal dan tujuan tidak boleh sama.');
                    return;
                }
                txs.push({
                    id: createId(),
                    amount: +amount,
                    type,
                    text: `Transfer ke ${wallets.find(w => w.id === toWalletId)?.name}`,
                    fromWalletId,
                    toWalletId,
                    category: 'Transfer',
                    date: txDate
                });
                if (adminFeeNum > 0) txs.push({
                    id: createId(),
                    amount: adminFeeNum,
                    type: 'expense',
                    text: 'Biaya Admin Transfer',
                    walletId: fromWalletId,
                    category: 'Biaya Admin',
                    date: txDate
                });
            } else {
                if (!text.trim()) {
                    setError('Deskripsi harus diisi.');
                    return;
                }
                if (!category) {
                    setError('Kategori harus dipilih.');
                    return;
                }
                const totalAmount = type === 'expense' ? (+amount + adminFeeNum) : +amount;
                const updatedText = type === 'expense' && adminFeeNum > 0 ? `${text} (+ Biaya Admin)` : text;
                txs.push({
                    id: createId(),
                    amount: totalAmount,
                    type,
                    text: updatedText,
                    category,
                    walletId,
                    date: txDate
                });
            }

            onAddTransactions(txs);
        }
    };

    const handleAddNewCategory = (categoryName) => {
        // onAddCategory di App.js sekarang mengharapkan objek {name, icon}
        return onAddCategory({name: categoryName, icon: null});
    };

    const TabButton = ({tabName, label}) => (<button onClick={() => {
        if (isEditMode) return;
        setActiveTab(tabName);
        handleInputChange('type', tabName);
        setIsKeypadVisible(false);
    }}
                                                     disabled={isEditMode}
                                                     className={`w-full p-2 text-center font-semibold border-b-4 ${activeTab === tabName ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>{label}</button>);

    const debtOptions = [{id: 'new', name: 'Buat Baru'}, {id: 'payment', name: 'Bayar / Terima Cicilan'}];
    const newDebtOptions = [{id: 'new_piutang', name: 'Memberi Pinjaman'}, {id: 'new_utang', name: 'Membuat Utang'}];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-end" onClick={onClose}>
            <div
                className="bg-white rounded-t-2xl shadow-2xl w-full max-w-lg mx-auto relative animate-fade-in-up flex flex-col"
                style={{ maxHeight: 'calc(var(--app-height, 100vh) * 0.9)' }}
                onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center"><h2
                    className="text-xl font-bold">{isEditMode ? 'Edit Transaksi' : 'Transaksi Baru'}</h2>
                    <button onClick={onClose}><CloseIcon/></button>
                </div>
                <div className="flex border-b"><TabButton tabName="expense" label="Pengeluaran"/><TabButton
                    tabName="income"
                    label="Pemasukan"/><TabButton
                    tabName="transfer" label="Transfer"/><TabButton tabName="debt" label="Utang/Piutang"/></div>
                <div className="p-6 space-y-4 overflow-y-auto">{error &&
                    <p className="bg-red-100 text-red-700 p-3 rounded-lg text-sm"
                       onClick={() => setError('')}>{error}</p>}
                    <div className="flex gap-4">
                        <div className="flex-grow"><label
                            className="block text-sm font-medium mb-1">Jumlah</label><input
                            type="text" readOnly value={formatCurrency(form.amount || 0)} onFocus={() => {
                            setIsKeypadVisible(true);
                            setKeypadTarget('amount');
                        }} className="w-full p-3 bg-gray-50 rounded-lg text-right text-2xl font-bold cursor-pointer"/>
                        </div>
                        {(activeTab === 'expense' || activeTab === 'transfer') &&
                            <div className="w-1/3"><label className="block text-sm font-medium mb-1">Biaya
                                Admin</label><input type="text" readOnly value={formatCurrency(form.adminFee || 0)}
                                                    onFocus={() => {
                                                        setIsKeypadVisible(true);
                                                        setKeypadTarget('adminFee');
                                                    }}
                                                    className="w-full p-3 bg-gray-50 rounded-lg text-right text-xl font-bold cursor-pointer"/>
                            </div>}</div>
                    {activeTab === 'transfer' ? (
                            <div className="grid grid-cols-2 gap-4"><SearchableWalletSelector label="Dari Dompet"
                                                                                              wallets={wallets}
                                                                                              selectedId={form.fromWalletId}
                                                                                              onSelect={val => handleInputChange('fromWalletId', val)}
                                                                                              onFocus={() => setIsKeypadVisible(false)}/><SearchableWalletSelector
                                label="Ke Dompet" wallets={wallets.filter(w => w.id !== form.fromWalletId)}
                                selectedId={form.toWalletId} onSelect={val => handleInputChange('toWalletId', val)}
                                onFocus={() => setIsKeypadVisible(false)}/></div>)
                        : activeTab === 'debt' ? (<><CustomSelect label="Mode" options={debtOptions}
                                                                  selectedId={form.debtMode}
                                                                  onSelect={val => handleInputChange('debtMode', val)}
                                                                  onFocus={() => setIsKeypadVisible(false)}/> {form.debtMode === 'new' &&
                                <CustomSelect label="Jenis Transaksi" options={newDebtOptions} selectedId={form.debtAction}
                                              onSelect={val => handleInputChange('debtAction', val)}
                                              onFocus={() => setIsKeypadVisible(false)}/>}<AutocompleteInput
                                value={form.contactName} onChange={val => handleInputChange('contactName', val)}
                                suggestions={contacts} onFocus={() => setIsKeypadVisible(false)}
                                label="Nama Kontak"/><SearchableWalletSelector label="Pilih Dompet" wallets={wallets}
                                                                               selectedId={form.walletId}
                                                                               onSelect={val => {
                                                                                   handleInputChange('walletId', val);
                                                                                   if (form.useBorrowedForExpense) handleInputChange('expenseWalletId', val);
                                                                               }}
                                                                               onFocus={() => setIsKeypadVisible(false)}/>
                                {form.debtMode === 'new' && form.debtAction === 'new_utang' && (
                                    <div className="mt-3 space-y-3 bg-blue-50 rounded-xl p-4 border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-blue-800">Gunakan langsung untuk
                                                    pengeluaran</p>
                                                <p className="text-xs text-blue-600">Catat pembelian saat uang utang
                                                    dipakai.</p>
                                            </div>
                                            <label
                                                className="inline-flex items-center cursor-pointer space-x-2 text-xs text-blue-600">
                                                <span>Tidak</span>
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={form.useBorrowedForExpense}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setForm(prev => ({
                                                            ...prev,
                                                            useBorrowedForExpense: checked,
                                                            expenseWalletId: checked ? prev.walletId : '',
                                                            expenseText: checked ? prev.expenseText : '',
                                                            expenseCategory: checked ? prev.expenseCategory : ''
                                                        }));
                                                    }}
                                                />
                                                <span>Ya</span>
                                            </label>
                                        </div>
                                        {form.useBorrowedForExpense && (<>
                                            <AutocompleteInput
                                                value={form.expenseText}
                                                onChange={val => handleInputChange('expenseText', val)}
                                                suggestions={descriptionHistory}
                                                onFocus={() => setIsKeypadVisible(false)}
                                                label="Deskripsi Pengeluaran"/>
                                            <SearchableCategorySelector
                                                categories={selectableCategories}
                                                selected={form.expenseCategory}
                                                onSelect={val => handleInputChange('expenseCategory', val)}
                                                onAddCategory={handleAddNewCategory}
                                                onFocus={() => setIsKeypadVisible(false)}
                                                label="Kategori Pengeluaran"/>
                                            <SearchableWalletSelector
                                                label="Dompet Pengeluaran"
                                                wallets={wallets}
                                                selectedId={form.expenseWalletId || form.walletId}
                                                onSelect={val => handleInputChange('expenseWalletId', val)}
                                                onFocus={() => setIsKeypadVisible(false)}
                                            />
                                        </>)}
                                    </div>)}</>)
                            : (<><SearchableWalletSelector label="Dompet" wallets={wallets} selectedId={form.walletId}
                                                           onSelect={val => handleInputChange('walletId', val)}
                                                           onFocus={() => setIsKeypadVisible(false)}/><AutocompleteInput
                                value={form.text} onChange={val => handleInputChange('text', val)}
                                suggestions={descriptionHistory}
                                onFocus={() => setIsKeypadVisible(false)}/><SearchableCategorySelector
                                categories={selectableCategories}
                                selected={form.category} onSelect={val => handleInputChange('category', val)}
                                onAddCategory={handleAddNewCategory} onFocus={() => setIsKeypadVisible(false)}/></>)}
                    <div className="relative"><label
                        className="block text-sm font-medium text-gray-600 mb-1">Tanggal</label>
                        <button type="button" onClick={() => setIsDatePickerOpen(prev => !prev)}
                                className="w-full text-left px-4 py-3 bg-gray-50 border rounded-lg cursor-pointer flex justify-between items-center">
                        <span>{new Date(form.date).toLocaleDateString('id-ID', {
                            timeZone: 'UTC',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}</span><CalendarIcon/></button>
                    </div>
                    <div className="pt-2">
                        <button onClick={handleSubmit}
                                className="w-full h-14 bg-blue-600 text-white text-xl font-bold rounded-lg">Simpan
                        </button>
                    </div>
                </div>
                {isDatePickerOpen && <DatePickerDialog selectedDate={form.date} onSelectDate={(d) => {
                    handleInputChange('date', d);
                    setIsDatePickerOpen(false);
                }} onClose={() => setIsDatePickerOpen(false)}/>}</div>
            {isKeypadVisible && <NumericKeypad displayValue={form[keypadTarget]}
                                               onKeyPress={key => handleInputChange(keypadTarget, (form[keypadTarget] + key).replace(/^0+/, ''))}
                                               onDelete={() => handleInputChange(keypadTarget, form[keypadTarget].slice(0, -1))}
                                               onHide={() => setIsKeypadVisible(false)}/>}</div>);
}
