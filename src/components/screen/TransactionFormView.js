import React, {useEffect, useMemo, useState} from "react";
import {createId, formatCurrency, getTodayISO} from "../../utils/helpers";
import {ArrowLeftIcon, CalendarIcon} from "../../utils/icons";
import {SearchableWalletSelector} from "../widget/SearchableWalletSelector";
import {CustomSelect} from "../widget/CustomSelect";
import {AutocompleteInput} from "../widget/AutoComplete";
import {SearchableCategorySelector} from "../widget/SearchableCategorySelector";
import {DatePickerDialog} from "../widget/DatePickerDialog";
import {NumericKeypad} from "../widget/NumericKeypad";
import {useApp} from "../../context/AppContext";

export function TransactionFormView({
                                        onBack,
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
        walletBalances,
        descriptionCategoryMap
    } = useApp();

    const isEditMode = transactionToEdit != null;
    const [activeTab, setActiveTab] = useState(transactionToEdit?.type || 'expense');
    const [form, setForm] = useState(() => ({
        text: transactionToEdit?.text || '',
        amount: transactionToEdit?.amount?.toString() || '',
        adminFee: '',
        type: transactionToEdit?.type || 'expense',
        category: transactionToEdit?.category || '',
        walletId: wallets[0]?.id || '',
        fromWalletId: wallets[0]?.id || '',
        toWalletId: wallets[1]?.id || '',
        date: transactionToEdit ? new Date(transactionToEdit.date).toISOString().split('T')[0] : getTodayISO(),
        contactName: transactionToEdit?.contactName || '',
        debtAction: 'new_piutang',
        debtMode: 'new',
        useBorrowedForExpense: false,
        expenseCategory: '',
        expenseText: '',
        expenseWalletId: wallets[0]?.id || '',
        tags: transactionToEdit?.tags || []
    }));
    const [error, setError] = useState('');
    const [isKeypadVisible, setIsKeypadVisible] = useState(false);
    const [keypadTarget, setKeypadTarget] = useState('amount');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    useEffect(() => {
        if (isEditMode && transactionToEdit) {
            const tx = transactionToEdit;
            setActiveTab(tx.type);
            setForm({
                text: tx.text || '',
                amount: tx.amount?.toString() || '',
                adminFee: '',
                type: tx.type,
                category: tx.category || '',
                walletId: tx.walletId || wallets[0]?.id || '',
                fromWalletId: tx.fromWalletId || wallets[0]?.id || '',
                toWalletId: tx.toWalletId || wallets[1]?.id || '',
                date: new Date(tx.date).toISOString().split('T')[0],
                contactName: tx.contactName || '',
                debtAction: 'new_piutang',
                debtMode: 'new',
                useBorrowedForExpense: false,
                expenseCategory: '',
                expenseText: '',
                expenseWalletId: tx.walletId || wallets[0]?.id || '',
                tags: tx.tags || []
            });
        } else {
            setForm(prev => ({
                ...prev,
                walletId: prev.walletId || wallets[0]?.id || '',
                fromWalletId: prev.fromWalletId || wallets[0]?.id || '',
                toWalletId: prev.toWalletId || wallets[1]?.id || wallets[0]?.id || '',
                expenseWalletId: prev.expenseWalletId || wallets[0]?.id || ''
            }));
        }
    }, [isEditMode, transactionToEdit, wallets]);

    const selectableCategories = useMemo(() => {
        const excluded = ['Utang', 'Piutang', 'Pembayaran Utang', 'Penerimaan Piutang'];
        return categories.filter(cat => !excluded.includes(cat?.name || cat));
    }, [categories]);

    const handleInputChange = (field, value) => {
        setForm(prev => ({...prev, [field]: value}));
    };

    const handleDescriptionSuggestionSelect = (selectedText) => {
        if (form.category) return;
        const key = selectedText?.trim().toLowerCase();
        if (!key) return;
        const matchedCategory = descriptionCategoryMap[key];
        if (matchedCategory) {
            handleInputChange('category', matchedCategory);
        }
    };

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
            expenseWalletId,
            tags: formTags
        } = form;
        const tags = (formTags || []).map(tag => tag.trim()).filter(Boolean);

        if (!amount || +amount === 0) {
            setError('Jumlah tidak boleh kosong.');
            return;
        }

        const checkWalletBalance = (walletIdToCheck, amountToSpend) => {
            if (!walletIdToCheck || amountToSpend <= 0) return true;
            const balance = walletBalances[walletIdToCheck] || 0;
            const wallet = wallets.find(w => w.id === walletIdToCheck);
            if (wallet && balance < amountToSpend) {
                return window.confirm(
                    `Saldo dompet "${wallet.name}" tidak mencukupi (Saldo: ${formatCurrency(balance)}, Pengeluaran: ${formatCurrency(amountToSpend)}). Tetap lanjutkan?`
                );
            }
            return true;
        };
        const txDate = new Date(date).toISOString();

        if (isEditMode) {
            const originalCategoryName = typeof transactionToEdit.category === 'string'
                ? transactionToEdit.category
                : transactionToEdit.category?.name || '';

            if (transactionToEdit.type === 'debt' || originalCategoryName.includes('Utang') || originalCategoryName.includes('Piutang')) {
                setError('Mengedit transaksi utang/piutang belum didukung.');
                return;
            }

            const oldTx = transactionToEdit;
            const newAmount = +amount;

            if (type === 'expense') {
                const isSameWallet = oldTx.walletId === walletId;
                const amountToVerify = isSameWallet ? newAmount - oldTx.amount : newAmount;
                if (!checkWalletBalance(walletId, amountToVerify)) return;
            } else if (type === 'transfer') {
                const isSameWallet = oldTx.fromWalletId === fromWalletId;
                const amountToVerify = isSameWallet ? newAmount - oldTx.amount : newAmount;
                if (!checkWalletBalance(fromWalletId, amountToVerify)) return;
            }

            let updatedTx = {...oldTx, amount: newAmount, date: txDate, tags};

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
            } else {
                if (!text.trim()) {
                    setError('Deskripsi harus diisi.');
                    return;
                }
                updatedTx = {...updatedTx, text, category, walletId};
            }
            onEditTransaction(updatedTx);
            return;
        }

        const amountNum = +amount;
        const adminFeeNum = Number(adminFee) || 0;

        if (type === 'expense') {
            if (!checkWalletBalance(walletId, amountNum + adminFeeNum)) return;
        } else if (type === 'transfer') {
            if (!checkWalletBalance(fromWalletId, amountNum + adminFeeNum)) return;
        } else if (type === 'debt') {
            if (debtMode === 'new' && debtAction === 'new_piutang') {
                if (!checkWalletBalance(walletId, amountNum)) return;
            } else if (debtMode === 'payment') {
                const balance = contactBalances[contactName] || 0;
                if (balance < 0 && !checkWalletBalance(walletId, amountNum)) return;
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
                        contactName,
                        tags
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
                date: txDate,
                tags
            });
            if (adminFeeNum > 0) {
                txs.push({
                    id: createId(),
                    amount: adminFeeNum,
                    type: 'expense',
                    text: 'Biaya Admin Transfer',
                    walletId: fromWalletId,
                    category: 'Biaya Admin',
                    date: txDate
                });
            }
        } else {
            if (!text.trim()) {
                setError('Deskripsi harus diisi.');
                return;
            }
            if (!category) {
                setError('Kategori harus dipilih.');
                return;
            }
            const totalAmount = type === 'expense' ? (amountNum + adminFeeNum) : amountNum;
            const updatedText = type === 'expense' && adminFeeNum > 0 ? `${text} (+ Biaya Admin)` : text;
            txs.push({
                id: createId(),
                amount: totalAmount,
                type,
                text: updatedText,
                category,
                walletId,
                date: txDate,
                tags
            });
        }

        onAddTransactions(txs);
    };

    const handleAddNewCategory = (categoryName) => onAddCategory({name: categoryName, icon: null});

    const TabButton = ({tabName, label}) => (
        <button
            onClick={() => {
                if (isEditMode) return;
                setActiveTab(tabName);
                handleInputChange('type', tabName);
                setIsKeypadVisible(false);
            }}
            disabled={isEditMode}
            className={`flex-1 py-3 text-center text-sm font-semibold border-b-4 ${activeTab === tabName ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
            {label}
        </button>
    );

    const debtOptions = [{id: 'new', name: 'Buat Baru'}, {id: 'payment', name: 'Bayar / Terima Cicilan'}];
    const newDebtOptions = [{id: 'new_piutang', name: 'Memberi Pinjaman'}, {id: 'new_utang', name: 'Membuat Utang'}];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-sm z-20">
                <div className="max-w-lg mx-auto flex items-center gap-4 px-4 py-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <ArrowLeftIcon/>
                    </button>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">{isEditMode ? 'Edit' : 'Tambah'} Transaksi</p>
                        <h1 className="text-xl font-bold text-gray-800">{activeTab === 'debt' ? 'Utang / Piutang' : activeTab === 'transfer' ? 'Transfer' : activeTab === 'income' ? 'Pemasukan' : 'Pengeluaran'}</h1>
                    </div>
                </div>
                <div className="border-t border-gray-100">
                    <div className="max-w-lg mx-auto flex">
                        <TabButton tabName="expense" label="Pengeluaran"/>
                        <TabButton tabName="income" label="Pemasukan"/>
                        <TabButton tabName="transfer" label="Transfer"/>
                        <TabButton tabName="debt" label="Utang/Piutang"/>
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full">
                <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-32">
                    {error && (
                        <button className="w-full bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg text-sm"
                                onClick={() => setError('')}>{error}</button>
                    )}

                    <div className="flex gap-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium mb-1">Jumlah</label>
                            <input
                                type="text"
                                readOnly
                                value={formatCurrency(form.amount || 0)}
                                onFocus={() => {
                                    setIsKeypadVisible(true);
                                    setKeypadTarget('amount');
                                }}
                                className="w-full p-3 bg-white border rounded-lg text-right text-2xl font-bold cursor-pointer"
                            />
                        </div>
                        {(activeTab === 'expense' || activeTab === 'transfer') && (
                            <div className="w-1/3">
                                <label className="block text-sm font-medium mb-1">Biaya Admin</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formatCurrency(form.adminFee || 0)}
                                    onFocus={() => {
                                        setIsKeypadVisible(true);
                                        setKeypadTarget('adminFee');
                                    }}
                                    className="w-full p-3 bg-white border rounded-lg text-right text-xl font-bold cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    {activeTab === 'transfer' ? (
                        <div className="grid grid-cols-1 gap-4">
                            <SearchableWalletSelector
                                label="Dari Dompet"
                                wallets={wallets}
                                selectedId={form.fromWalletId}
                                onSelect={val => handleInputChange('fromWalletId', val)}
                                onFocus={() => setIsKeypadVisible(false)}
                            />
                            <SearchableWalletSelector
                                label="Ke Dompet"
                                wallets={wallets.filter(w => w.id !== form.fromWalletId)}
                                selectedId={form.toWalletId}
                                onSelect={val => handleInputChange('toWalletId', val)}
                                onFocus={() => setIsKeypadVisible(false)}
                            />
                        </div>
                    ) : activeTab === 'debt' ? (
                        <>
                            <CustomSelect
                                label="Mode"
                                options={debtOptions}
                                selectedId={form.debtMode}
                                onSelect={val => handleInputChange('debtMode', val)}
                                onFocus={() => setIsKeypadVisible(false)}
                            />
                            {form.debtMode === 'new' && (
                                <CustomSelect
                                    label="Jenis Transaksi"
                                    options={newDebtOptions}
                                    selectedId={form.debtAction}
                                    onSelect={val => handleInputChange('debtAction', val)}
                                    onFocus={() => setIsKeypadVisible(false)}
                                />
                            )}
                            <AutocompleteInput
                                value={form.contactName}
                                onChange={val => handleInputChange('contactName', val)}
                                suggestions={contacts}
                                onFocus={() => setIsKeypadVisible(false)}
                                label="Nama Kontak"
                            />
                            {form.debtMode === 'new' ? (
                                <>
                                    <SearchableWalletSelector
                                        label="Dompet"
                                        wallets={wallets}
                                        selectedId={form.walletId}
                                        onSelect={val => handleInputChange('walletId', val)}
                                        onFocus={() => setIsKeypadVisible(false)}
                                    />
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">Pakai langsung untuk belanja?</p>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={form.useBorrowedForExpense}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    handleInputChange('useBorrowedForExpense', checked);
                                                    setForm(prev => ({
                                                        ...prev,
                                                        expenseWalletId: checked ? prev.walletId : '',
                                                        expenseText: checked ? prev.expenseText : '',
                                                        expenseCategory: checked ? prev.expenseCategory : ''
                                                    }));
                                                }}
                                            />
                                            <span>Ya</span>
                                        </label>
                                    </div>
                                    {form.useBorrowedForExpense && (
                                        <>
                                            <AutocompleteInput
                                                value={form.expenseText}
                                                onChange={val => handleInputChange('expenseText', val)}
                                                suggestions={descriptionHistory}
                                                onFocus={() => setIsKeypadVisible(false)}
                                                label="Deskripsi Pengeluaran"
                                            />
                                            <SearchableCategorySelector
                                                categories={selectableCategories}
                                                selected={form.expenseCategory}
                                                onSelect={val => handleInputChange('expenseCategory', val)}
                                                onAddCategory={handleAddNewCategory}
                                                onFocus={() => setIsKeypadVisible(false)}
                                                label="Kategori Pengeluaran"
                                            />
                                            <SearchableWalletSelector
                                                label="Dompet Pengeluaran"
                                                wallets={wallets}
                                                selectedId={form.expenseWalletId || form.walletId}
                                                onSelect={val => handleInputChange('expenseWalletId', val)}
                                                onFocus={() => setIsKeypadVisible(false)}
                                            />
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <SearchableWalletSelector
                                        label="Dompet"
                                        wallets={wallets}
                                        selectedId={form.walletId}
                                        onSelect={val => handleInputChange('walletId', val)}
                                        onFocus={() => setIsKeypadVisible(false)}
                                    />
                                    <p className="text-xs text-gray-500">Dompet tempat membayar atau menerima cicilan.</p>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <SearchableWalletSelector
                                label="Dompet"
                                wallets={wallets}
                                selectedId={form.walletId}
                                onSelect={val => handleInputChange('walletId', val)}
                                onFocus={() => setIsKeypadVisible(false)}
                            />
                            <AutocompleteInput
                                value={form.text}
                                onChange={val => handleInputChange('text', val)}
                                suggestions={descriptionHistory}
                                onFocus={() => setIsKeypadVisible(false)}
                                label={activeTab === 'income' ? 'Sumber' : 'Deskripsi'}
                                onSuggestionSelect={handleDescriptionSuggestionSelect}
                            />
                            <SearchableCategorySelector
                                categories={selectableCategories}
                                selected={form.category}
                                onSelect={val => handleInputChange('category', val)}
                                onAddCategory={handleAddNewCategory}
                                onFocus={() => setIsKeypadVisible(false)}
                            />
                            {(activeTab === 'expense' || activeTab === 'income') && (
                                <TagInput
                                    value={form.tags}
                                    onChange={tagsValue => handleInputChange('tags', tagsValue)}
                                    onFocus={() => setIsKeypadVisible(false)}
                                />
                            )}
                        </>
                    )}

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal</label>
                        <button
                            type="button"
                            onClick={() => setIsDatePickerOpen(prev => !prev)}
                            className="w-full text-left px-4 py-3 bg-white border rounded-lg cursor-pointer flex justify-between items-center"
                        >
                            <span>{new Date(form.date).toLocaleDateString('id-ID', {
                                timeZone: 'UTC',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}</span>
                            <CalendarIcon/>
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full h-14 bg-blue-600 text-white text-xl font-bold rounded-lg"
                    >
                        Simpan
                    </button>
                </div>
            </div>

            {isDatePickerOpen && (
                <DatePickerDialog
                    selectedDate={form.date}
                    onSelectDate={(d) => {
                        handleInputChange('date', d);
                        setIsDatePickerOpen(false);
                    }}
                    onClose={() => setIsDatePickerOpen(false)}
                />
            )}

            {isKeypadVisible && (
                <NumericKeypad
                    value={form[keypadTarget]?.toString() || ''}
                    onChange={(val) => handleInputChange(keypadTarget, val)}
                    fieldKey={keypadTarget}
                    onHide={() => setIsKeypadVisible(false)}
                />
            )}
        </div>
    );
}

function TagInput({value = [], onChange, onFocus}) {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        setInputValue('');
    }, [value]);

    const handleAddTag = () => {
        const newTag = inputValue.trim();
        if (newTag && !value.includes(newTag)) {
            onChange([...value, newTag]);
        }
        setInputValue('');
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            handleAddTag();
        } else if (event.key === 'Backspace' && !inputValue && value.length > 0) {
            event.preventDefault();
            onChange(value.slice(0, -1));
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tag</label>
            <div className="flex flex-wrap gap-2 border rounded-lg bg-white px-3 py-2 focus-within:border-blue-500">
                {value.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                        {tag}
                        <button type="button" className="text-blue-500" onClick={() => onChange(value.filter(t => t !== tag))}>×</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={onFocus}
                    onKeyDown={handleKeyDown}
                    onBlur={handleAddTag}
                    placeholder="Contoh: travel, bandung"
                    className="flex-1 min-w-[150px] border-none focus:ring-0 text-sm"
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">Tekan Enter atau koma untuk menambahkan tag.</p>
        </div>
    );
}
