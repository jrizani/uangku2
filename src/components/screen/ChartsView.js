import React from 'react';
import { ArrowLeftIcon } from '../../utils/icons';

export function ChartsView({ onBack }) {
    return (
        <div className="container mx-auto max-w-lg p-4 pb-24">
            <header className="flex items-center my-6">
                <button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon /></button>
                <h1 className="text-2xl font-bold">Grafik Keuangan</h1>
            </header>
            <div className="bg-white rounded-xl shadow-md p-5 text-center">
                <p className="text-gray-600">Fitur chart akan segera hadir.</p>
                <p className="text-sm text-gray-400 mt-2">Anda dapat mengintegrasikan library seperti Chart.js atau Recharts di sini.</p>
            </div>
        </div>
    );
}