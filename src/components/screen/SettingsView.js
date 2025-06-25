import React, { useState } from 'react';
import { ArrowLeftIcon, LogOutIcon } from '../../utils/icons'; // Impor LogOutIcon
import { CategorySettings } from '../widget/CategorySettings';
import { DataManagement } from '../widget/DataManagement';
import { PinSettings } from '../widget/PinSettings';

// Terima prop onLogout
export function SettingsView({ onBack, categories, onUpdateCategory, onAddCategory, onDeleteCategory, onImportData, onLogout }) {
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

            {/* --- TOMBOL LOGOUT DI SINI --- */}
            <div className="mt-8">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-red-100 text-red-700 font-bold py-3 px-4 rounded-lg hover:bg-red-200 transition-colors"
                >
                    <LogOutIcon />
                    <span>Keluar (Logout)</span>
                </button>
            </div>
        </div>
    );
}