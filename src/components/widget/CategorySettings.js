import React, { useState } from 'react';
import { CategoryIcon } from './CategoryIcon';
import { IconPicker } from './IconPicker';
import { TrashIcon, PlusIcon, EditIcon } from '../../utils/icons';
import { getRandomColor } from '../../utils/helpers'; // Impor fungsi baru

export function CategorySettings({ categories, transactions, onUpdateCategory, onAddCategory, onDeleteCategory }) {
    const [editingCategory, setEditingCategory] = useState(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState('edit');

    // State untuk mengelola pengeditan nama kategori
    const [editingName, setEditingName] = useState({
        id: null, name: ''
    });

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

    // Handler untuk memulai edit nama
    const handleStartEditName = (category) => {
        setEditingName({ id: category.id, name: category.name });
    };

    // Handler untuk membatalkan edit nama
    const handleCancelEditName = () => {
        setEditingName({ id: null, name: '' });
    };

    // Handler untuk menyimpan nama baru
    const handleSaveName = () => {
        if (editingName.id && editingName.name.trim()) {
            const categoryToUpdate = categories.find(c => c.id === editingName.id);
            if (categoryToUpdate) {
                onUpdateCategory({ ...categoryToUpdate, name: editingName.name.trim() });
            }
        }
        handleCancelEditName();
    };

    const handleNameInputKeyDown = (e) => {
        if (e.key === 'Enter') handleSaveName();
        else if (e.key === 'Escape') handleCancelEditName();
    }

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
                {categories.filter(c => !['Utang', 'Piutang', 'Pembayaran Utang', 'Penerimaan Piutang'].includes(c.name)).map(category => {
                    const hasTransactions = transactions && transactions.some(tx => tx.categoryId === category.id);
                    const isEditingName = editingName.id === category.id;

                    return (
                        <div key={category.id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-grow">
                                <button
                                    onClick={() => handleOpenPickerForEdit(category)}
                                    className="rounded-full transition-transform transform hover:scale-110"
                                    title="Ganti Ikon"
                                >
                                    <CategoryIcon icon={category.icon} name={category.name} color={category.color} />
                                </button>
                                {isEditingName ? (
                                    <input
                                        type="text"
                                        value={editingName.name}
                                        onChange={e => setEditingName({ ...editingName, name: e.target.value })}
                                        onKeyDown={handleNameInputKeyDown}
                                        onBlur={handleSaveName}
                                        className="flex-grow w-full px-2 py-1 bg-white border border-blue-400 rounded-md"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="font-semibold">{category.name}</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                                {!isEditingName && (
                                    <button onClick={() => handleStartEditName(category)} className="text-gray-400 hover:text-blue-500" title="Ubah Nama">
                                        <EditIcon />
                                    </button>
                                )}
                                <button onClick={() => onDeleteCategory(category.id)} disabled={hasTransactions} className={`text-gray-400 ${hasTransactions ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500'}`} title={hasTransactions ? "Kategori tidak dapat dihapus karena sudah memiliki transaksi" : "Hapus Kategori"}>
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    );
                })}
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