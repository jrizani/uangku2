import React, { useState } from 'react';
import { CategoryIcon } from './CategoryIcon';
import { IconPicker } from './IconPicker';
import { TrashIcon, PlusIcon } from '../../utils/icons';
import { getRandomColor } from '../../utils/helpers'; // Impor fungsi baru

export function CategorySettings({ categories, onUpdateCategory, onAddCategory, onDeleteCategory }) {
    const [editingCategory, setEditingCategory] = useState(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState('edit');

    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState(null);

    const handleOpenPickerForEdit = (category) => {
        setEditingCategory(category);
        setPickerMode('edit');
        setIsPickerOpen(true);
    };

    const handleOpenPickerForAdd = () => {
        setPickerMode('add');
        setIsPickerOpen(true);
    };

    const handleSelectIcon = (icon) => {
        const randomColor = getRandomColor(); // Ambil warna acak
        if (pickerMode === 'edit' && editingCategory) {
            // Sertakan warna baru saat update
            onUpdateCategory({ ...editingCategory, icon, color: randomColor });
        } else if (pickerMode === 'add') {
            // Simpan juga objek warnanya
            setNewCategoryIcon({ ...icon, color: randomColor });
        }
        setIsPickerOpen(false);
        setEditingCategory(null);
    };

    const handleAdd = () => {
        if (newCategoryName.trim()) {
            // Jika belum pilih ikon, generate warna acak untuk ikon default
            const color = newCategoryIcon?.color || getRandomColor();
            onAddCategory({
                name: newCategoryName.trim(),
                icon: newCategoryIcon,
                color: color
            });
            setNewCategoryName('');
            setNewCategoryIcon(null);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Kelola Kategori</h2>

            <div className="mb-6 border-t pt-4">
                <h3 className="font-bold mb-2">Tambah Kategori Baru</h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleOpenPickerForAdd}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        {/* Teruskan warna ke CategoryIcon */}
                        <CategoryIcon icon={newCategoryIcon} name={newCategoryName || '?'} color={newCategoryIcon?.color} />
                    </button>
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Nama kategori baru"
                        className="flex-grow w-full px-4 py-2 bg-gray-100 border rounded-lg"
                    />
                    <button onClick={handleAdd} className="bg-blue-600 text-white font-bold p-2 rounded-lg" title="Tambah Kategori">
                        <PlusIcon />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {categories.filter(c => !['Utang', 'Piutang', 'Pembayaran Utang', 'Penerimaan Piutang'].includes(c.name)).map(category => (
                    <div key={category.id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => handleOpenPickerForEdit(category)}
                                className="rounded-full transition-transform transform hover:scale-110"
                                title="Ganti Ikon"
                            >
                                {/* Teruskan warna ke CategoryIcon */}
                                <CategoryIcon icon={category.icon} name={category.name} color={category.color} />
                            </button>
                            <span className="font-semibold">{category.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => onDeleteCategory(category.id)} className="text-gray-400 hover:text-red-500" title="Hapus Kategori">
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isPickerOpen && (
                <IconPicker
                    onSelect={handleSelectIcon}
                    onClose={() => setIsPickerOpen(false)}
                />
            )}
        </div>
    );
}