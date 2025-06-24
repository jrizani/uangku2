import React, { useState, useMemo } from 'react';
import { CloseIcon } from '../../utils/icons';

// Daftar ikon FontAwesome gratis yang umum
const faIcons = [ 'fas fa-utensils', 'fas fa-bus', 'fas fa-file-invoice', 'fas fa-shopping-cart', 'fas fa-film', 'fas fa-university', 'fas fa-adjust', 'fas fa-home', 'fas fa-heart', 'fas fa-gift', 'fas fa-plane', 'fas fa-medkit', 'fas fa-book', 'fas fa-briefcase', 'fas fa-tshirt', 'fas fa-gas-pump', 'fas fa-mobile-alt', 'fas fa-laptop', 'fas fa-gamepad', 'fas fa-paw', 'fas fa-baby', 'fas fa-car', 'fas fa-bicycle', 'fas fa-train', 'fas fa-subway', 'fas fa-ship', 'fas fa-lightbulb', 'fas fa-pills', 'fas fa-graduation-cap', 'fas fa-coffee', 'fas fa-beer', 'fas fa-ice-cream', 'fas fa-pizza-slice', 'fas fa-hamburger', 'fas fa-dog', 'fas fa-cat', 'fas fa-tree', 'fas fa-mountain', 'fas fa-music', 'fas fa-futbol', 'fas fa-basketball-ball', 'fas fa-volleyball-ball', 'fas fa-dollar-sign', 'fas fa-euro-sign', 'fas fa-pound-sign', 'fas fa-yen-sign' ];

export function IconPicker({ onSelect, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredIcons = useMemo(() => {
        if (!searchTerm) return faIcons;
        return faIcons.filter(icon => icon.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">Pilih Ikon</h3>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Cari ikon..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg mb-4"
                    />
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-4 p-4 max-h-64 overflow-y-auto">
                    {filteredIcons.map(iconClass => (
                        <button key={iconClass} onClick={() => onSelect(iconClass)} className="p-2 flex justify-center items-center rounded-lg hover:bg-gray-100 text-2xl">
                            <i className={iconClass}></i>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}