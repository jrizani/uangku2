import React, { useRef } from 'react';
import { DownloadIcon, UploadIcon } from '../../utils/icons';

const ACCOUNT_DATA_SUFFIXES = ['wallets', 'transactions', 'categories', 'descriptions', 'contacts', 'pin'];
const getAccountScopedKey = (accountId, suffix) => `moneyplus_${accountId}_${suffix}`;

export function DataManagement({
    onImport,
    accounts = [],
    activeAccountId,
    onCreateAccount,
    onRenameAccount,
    onDeleteAccount,
    onSelectAccount
}) {
    const fileInputRef = useRef(null);

    const handleExport = () => {
        try {
            if (!accounts.length) {
                // eslint-disable-next-line no-alert
                alert('Belum ada akun untuk diekspor.');
                return;
            }

            const dataToExport = {
                moneyplus_accounts: accounts,
                moneyplus_active_account: activeAccountId,
                accounts: {}
            };

            accounts.forEach(account => {
                const accountData = {};
                ACCOUNT_DATA_SUFFIXES.forEach(suffix => {
                    const storedValue = localStorage.getItem(getAccountScopedKey(account.id, suffix));
                    if (storedValue) {
                        accountData[suffix] = JSON.parse(storedValue);
                    }
                });
                dataToExport.accounts[account.id] = accountData;
            });

            // Simpan juga data akun aktif menggunakan format lama agar kompatibel dengan versi sebelumnya
            if (activeAccountId && dataToExport.accounts[activeAccountId]) {
                const legacy = dataToExport.accounts[activeAccountId];
                ACCOUNT_DATA_SUFFIXES.forEach(suffix => {
                    if (legacy[suffix] !== undefined) {
                        const legacyKey = `moneyplus_${suffix}`;
                        dataToExport[legacyKey] = legacy[suffix];
                    }
                });
            }

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const href = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            const date = new Date().toISOString().split('T')[0];
            link.download = `uangku_backup_${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);

        } catch (error) {
            console.error('Gagal mengekspor data:', error);
            alert('Terjadi kesalahan saat mengekspor data.');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const data = JSON.parse(text);
                onImport(data);
            } catch (error) {
                console.error('Gagal mengimpor data:', error);
                alert('Gagal membaca file. Pastikan file backup valid.');
            }
        };
        reader.readAsText(file);
        // Reset input agar bisa memilih file yang sama lagi
        event.target.value = null;
    };

    const handleCreateAccountClick = () => {
        if (!onCreateAccount) return;
        // eslint-disable-next-line no-alert
        const name = prompt('Nama akun baru');
        if (name) {
            onCreateAccount(name);
        }
    };

    const handleRenameAccountClick = (account) => {
        if (!onRenameAccount) return;
        // eslint-disable-next-line no-alert
        const name = prompt('Ubah nama akun', account.name);
        if (name && name.trim() && name !== account.name) {
            onRenameAccount(account.id, name);
        }
    };

    const handleDeleteAccountClick = (account) => {
        if (!onDeleteAccount) return;
        // eslint-disable-next-line no-alert
        if (confirm(`Hapus akun "${account.name}"? Semua data di dalamnya akan dihapus.`)) {
            onDeleteAccount(account.id);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Manajemen Data</h2>
            <div className="space-y-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Akun Tersimpan</h3>
                        <button
                            type="button"
                            onClick={handleCreateAccountClick}
                            className="rounded-md border border-blue-500 px-3 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                        >
                            Tambah Akun
                        </button>
                    </div>
                    <div className="space-y-2">
                        {accounts.length === 0 && (
                            <p className="text-sm text-gray-500">Belum ada akun. Tambahkan akun baru untuk memisahkan data seperti kas komunitas.</p>
                        )}
                        {accounts.map(account => (
                            <div key={account.id} className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{account.name}</p>
                                    <p className="text-xs text-gray-500">{account.id === activeAccountId ? 'Sedang aktif' : 'Klik "Pilih" untuk membuka'}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {onSelectAccount && account.id !== activeAccountId && (
                                        <button
                                            type="button"
                                            onClick={() => onSelectAccount(account.id)}
                                            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                                        >
                                            Pilih
                                        </button>
                                    )}
                                    {onRenameAccount && (
                                        <button
                                            type="button"
                                            onClick={() => handleRenameAccountClick(account)}
                                            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                                        >
                                            Ubah Nama
                                        </button>
                                    )}
                                    {onDeleteAccount && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAccountClick(account)}
                                            disabled={accounts.length <= 1}
                                            className={`rounded-md border px-3 py-1 text-xs font-semibold transition-colors ${accounts.length <= 1 ? 'cursor-not-allowed border-gray-200 text-gray-300' : 'border-red-500 text-red-600 hover:bg-red-50'}`}
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    Simpan seluruh data (termasuk semua akun) ke file cadangan, atau pulihkan data dari file backup yang sudah ada. Ini berguna saat Anda ingin memindahkan data ke perangkat lain.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button onClick={handleExport} className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        <DownloadIcon />
                        <span>Ekspor Data</span>
                    </button>
                    <button onClick={handleImportClick} className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                        <UploadIcon />
                        <span>Impor Data</span>
                    </button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/json"
                    className="hidden"
                />
            </div>
        </div>
    );
}
