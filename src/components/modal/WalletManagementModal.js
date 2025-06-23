import React, {useState} from "react";
import {formatCurrency} from "../../utils/helpers";
import {CloseIcon, EditIcon, TrashIcon} from "../../utils/icons";

export function WalletManagementModal({onClose, wallets, walletBalances, transactions, onAdd, onEdit, onDelete}) {
    const [newWalletName, setNewWalletName] = useState('');
    const [initialBalance, setInitialBalance] = useState('');
    const [editingWallet, setEditingWallet] = useState(null);

    const handleAdd = () => {
        if (newWalletName.trim()) {
            onAdd(newWalletName.trim(), Number(initialBalance) || 0);
            setNewWalletName('');
            setInitialBalance('');
        }
    };
    const handleEdit = () => {
        if (editingWallet && editingWallet.name.trim()) {
            onEdit(editingWallet.id, editingWallet.name.trim(), editingWallet.balance);
            setEditingWallet(null);
        }
    };
    const handleDeleteWithConfirm = (wallet) => {
        const balance = walletBalances[wallet.id] || 0;
        let message = `Apakah Anda yakin ingin menghapus dompet "${wallet.name}"?`;
        if (balance !== 0) {
            message += `\n\nPERINGATAN: Dompet ini masih memiliki saldo ${formatCurrency(balance)}. Saldo akan hilang.`;
        }
        if (window.confirm(message)) {
            onDelete(wallet.id);
        }
    };
    const isWalletInUse = (walletId) => transactions.some(t => t.walletId === walletId || t.fromWalletId === walletId || t.toWalletId === walletId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 relative animate-fade-in-up"
                 onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Manajemen
                    Dompet</h2>
                    <button onClick={onClose}><CloseIcon/></button>
                </div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">{wallets.map(wallet => (
                    <div key={wallet.id} className="bg-gray-50 p-3 rounded-lg">{editingWallet?.id === wallet.id ? (
                        <div className="space-y-2"><input type="text" value={editingWallet.name}
                                                          onChange={e => setEditingWallet({
                                                              ...editingWallet,
                                                              name: e.target.value
                                                          })} placeholder="Nama Dompet"
                                                          className="w-full font-semibold border-b-2 p-1"/> <input
                            type="number" value={editingWallet.balance}
                            onChange={e => setEditingWallet({...editingWallet, balance: e.target.value})}
                            placeholder="Saldo Baru" className="w-full font-semibold border-b-2 p-1"/>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button onClick={() => setEditingWallet(null)} className="text-sm">Batal</button>
                                <button onClick={handleEdit} className="text-sm font-bold text-blue-600">Simpan</button>
                            </div>
                        </div>) : (<div className="flex items-center justify-between"><p
                        className="font-semibold">{wallet.name}</p>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setEditingWallet({
                                id: wallet.id,
                                name: wallet.name,
                                balance: walletBalances[wallet.id] || 0
                            })} className="text-blue-600"><EditIcon/></button>
                            <button onClick={() => handleDeleteWithConfirm(wallet)} disabled={isWalletInUse(wallet.id)}
                                    className="disabled:text-gray-300 text-red-500"><TrashIcon
                                className={isWalletInUse(wallet.id) ? "text-gray-300" : ""}/></button>
                        </div>
                    </div>)}</div>))}</div>
                <div className="mt-6 border-t pt-4"><h3 className="font-bold mb-2">Tambah Dompet Baru</h3>
                    <div className="flex space-x-2"><input type="text" value={newWalletName}
                                                           onChange={e => setNewWalletName(e.target.value)}
                                                           placeholder="Nama dompet"
                                                           className="flex-grow w-full px-4 py-2 bg-gray-100 border rounded-lg"/><input
                        type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)}
                        placeholder="Saldo awal (opsional)" className="w-40 px-4 py-2 bg-gray-100 border rounded-lg"/>
                    </div>
                    <button onClick={handleAdd}
                            className="mt-2 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Tambah Dompet
                    </button>
                </div>
            </div>
        </div>);
}