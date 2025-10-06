import React, { useRef } from 'react';
import { DownloadIcon, UploadIcon } from '../../utils/icons';

export function DataManagement({ onImport }) {
    const fileInputRef = useRef(null);

    const handleExport = () => {
        try {
            const dataToExport = {};
            const keys = ['moneyplus_wallets', 'moneyplus_transactions', 'moneyplus_categories', 'moneyplus_descriptions', 'moneyplus_contacts', 'moneyplus_pin'];

            keys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    // Simpan sebagai string JSON agar konsisten
                    dataToExport[key] = JSON.parse(item);
                }
            });

            if (Object.keys(dataToExport).length === 0) {
                alert('Tidak ada data untuk diekspor.');
                return;
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

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Manajemen Data</h2>
            <div className="space-y-3">
                <p className="text-sm text-gray-600">
                    Simpan data Anda ke sebuah file (backup), atau pulihkan data dari file backup yang sudah ada. Ini berguna saat Anda ingin memindahkan data ke perangkat lain.
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