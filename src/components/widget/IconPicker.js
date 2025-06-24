import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { CloseIcon } from '../../utils/icons';
import Icon from '@mdi/react';

// Impor daftar ikon dari file JSON yang kita generate
import iconList from '../../data/icon-list.json';

export function IconPicker({ onSelect, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Inisialisasi Fuse.js untuk pencarian pintar
    const fuse = useMemo(() => new Fuse(iconList, {
        keys: ['search'],
        threshold: 0.4,
    }), []);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return iconList.slice(0, 100); // Tampilkan 100 ikon pertama jika tidak ada pencarian
        }
        return fuse.search(searchTerm).map(result => result.item);
    }, [searchTerm, fuse]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">Pilih Ikon</h3>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Cari ribuan ikon..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        autoFocus
                    />
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-4 flex-grow overflow-y-auto">
                    {searchResults.map(icon => (
                        <button
                            key={icon.id}
                            onClick={() => onSelect(icon)}
                            className="p-2 flex justify-center items-center rounded-lg hover:bg-gray-100 text-2xl text-gray-700 transition-colors"
                            title={icon.name}
                        >
                            {icon.type === 'fa' && <i className={icon.className}></i>}
                            {icon.type === 'mdi' && <Icon path={icon.path} size={1.2} />}
                        </button>
                    ))}
                    {searchResults.length === 0 && (
                        <p className="col-span-full text-center text-gray-500">Ikon tidak ditemukan.</p>
                    )}
                </div>
            </div>
        </div>
    );
}