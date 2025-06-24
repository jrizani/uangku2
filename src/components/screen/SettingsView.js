import React from 'react';
import { ArrowLeftIcon } from '../../utils/icons';
import { CategorySettings } from '../widget/CategorySettings';

export function SettingsView({ onBack, categories, onUpdateCategory, onAddCategory, onDeleteCategory }) {
    return (
        <div className="container mx-auto max-w-lg p-4 pb-24">
            <header className="flex items-center my-6">
                <button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon /></button>
                <h1 className="text-2xl font-bold">Pengaturan</h1>
            </header>

            <div className="bg-white rounded-xl shadow-md p-5">
                <CategorySettings
                    categories={categories}
                    onUpdateCategory={onUpdateCategory}
                    onAddCategory={onAddCategory}
                    onDeleteCategory={onDeleteCategory}
                />
            </div>
        </div>
    );
}