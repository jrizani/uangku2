import React, { useState } from 'react';
import { CategoryIcon } from './CategoryIcon';
import { IconPicker } from './IconPicker';
import { EditIcon, TrashIcon, PlusIcon } from '../../utils/icons';

export function CategorySettings({ categories, onUpdateCategory, onAddCategory, onDeleteCategory }) {
    const [editingCategory, setEditingCategory] = useState(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleSelectIcon = (icon) => {
        if (editingCategory) {
            onUpdateCategory({ ...editingCategory, icon });
        }
        setIsPickerOpen(false);
        setEditingCategory(null);
    };

    const handleAdd = () => {
        if (newCategoryName.trim()) {
            onAddCategory(newCategoryName.trim());
            setNewCategoryName('');
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Kelola Kategori</h2>

            <div className="mb-6 border-t pt-4">
                <h3 className="font-bold mb-2">Tambah Kategori Baru</h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Nama kategori"
                        className="flex-grow w-full px-4 py-2 bg-gray-100 border rounded-lg"
                    />
                    <button onClick={handleAdd} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                        <PlusIcon />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {categories.filter(c => !['Utang', 'Piutang', 'Pembayaran Utang', 'Penerimaan Piutang'].includes(c.name)).map(category => (
                    <div key={category.id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => { setEditingCategory(category); setIsPickerOpen(true); }}>
                                <CategoryIcon icon={category.icon} name={category.name} />
                            </button>
                            <span className="font-semibold">{category.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => onDeleteCategory(category.id)} className="text-gray-400 hover:text-red-500">
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