import React, { useState } from 'react';
import { ArrowLeftIcon } from '../../utils/icons';
import { CategorySettings } from '../widget/CategorySettings';
import { DataManagement } from '../widget/DataManagement'; // Impor komponen baru
import { PinSettings } from '../widget/PinSettings';

export function SettingsView({ onBack, categories, onUpdateCategory, onAddCategory, onDeleteCategory, onImportData }) {
    const [activeTab, setActiveTab] = useState('kategori');

    const TabButton = ({ tab, children }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-full text-center font-semibold pb-2 border-b-4 ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="container mx-auto max-w-lg p-4 pb-24">
            <header className="flex items-center my-6">
                <button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon /></button>
                <h1 className="text-2xl font-bold">Pengaturan</h1>
            </header>

            <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex border-b mb-6">
                    <TabButton tab="kategori">Kategori</TabButton>
                    <TabButton tab="data">Data</TabButton>
                    <TabButton tab="pin">Keamanan</TabButton>
                </div>

                {activeTab === 'kategori' && (
                    <CategorySettings
                        categories={categories}
                        onUpdateCategory={onUpdateCategory}
                        onAddCategory={onAddCategory}
                        onDeleteCategory={onDeleteCategory}
                    />
                )}
                {activeTab === 'data' && (
                    <DataManagement onImport={onImportData} />
                )}
                {activeTab === 'pin' && (
                    <PinSettings />
                )}

            </div>
        </div>
    );
}