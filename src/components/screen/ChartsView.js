import React, { useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {ArrowLeftIcon, SparklesIcon} from '../../utils/icons';
import { formatCurrency } from '../../utils/helpers';
import { CategoryIcon } from '../widget/CategoryIcon';
import {AnalysisCard} from "../widget/AnalysisCard";

// Daftarkan elemen-elemen Chart.js yang akan kita gunakan
ChartJS.register(ArcElement, Tooltip, Legend);

export function ChartsView({ onBack, transactions }) {
    const [timeRange, setTimeRange] = useState('thisMonth'); // 'thisMonth', 'lastMonth', 'allTime'
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const chartData = useMemo(() => {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const filteredTransactions = transactions.filter(tx => {
            if (tx.type !== 'expense') return false;

            const txDate = new Date(tx.date);
            if (timeRange === 'thisMonth') {
                return txDate >= startOfThisMonth;
            }
            if (timeRange === 'lastMonth') {
                return txDate >= startOfLastMonth && txDate <= endOfLastMonth;
            }
            return true; // allTime
        });

        const spendingByCategory = filteredTransactions.reduce((acc, tx) => {
            const categoryId = tx.category.id;
            if (!acc[categoryId]) {
                acc[categoryId] = {
                    ...tx.category,
                    total: 0
                };
            }
            acc[categoryId].total += tx.amount;
            return acc;
        }, {});

        const sortedData = Object.values(spendingByCategory).sort((a, b) => b.total - a.total);
        const totalSpending = sortedData.reduce((sum, item) => sum + item.total, 0);

        return {
            labels: sortedData.map(d => d.name),
            datasets: [{
                data: sortedData.map(d => d.total),
                backgroundColor: sortedData.map(d => d.color),
                borderColor: '#fff',
                borderWidth: 2,
            }],
            legendData: sortedData,
            totalSpending,
        };
    }, [transactions, timeRange]);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError('');
        setAnalysis(null);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactions: chartData.legendData.flatMap(cat =>
                        transactions.filter(t => t.category.id === cat.id && (timeRange === 'allTime' || /* logika tanggal di sini jika perlu */ true))
                    ),
                    period: timeRange === 'thisMonth' ? 'Bulan Ini' : timeRange === 'lastMonth' ? 'Bulan Lalu' : 'Semua Waktu'
                })
            });
            if (!response.ok) {
                throw new Error('Gagal mendapatkan respon dari server.');
            }
            const data = await response.json();
            setAnalysis(data);
        } catch (err) {
            setError('Tidak dapat terhubung ke layanan AI. Pastikan server backend berjalan.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                display: false // Kita akan buat legenda custom sendiri
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const percentage = ((value / chartData.totalSpending) * 100).toFixed(1);
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const TimeFilterButton = ({ value, label }) => (
        <button
            onClick={() => setTimeRange(value)}
            className={`px-4 py-1 rounded-full text-sm font-semibold ${timeRange === value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="container mx-auto max-w-lg p-4 pb-24">
            <header className="flex items-center my-6">
                <button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon /></button>
                <h1 className="text-2xl font-bold">Grafik Pengeluaran</h1>
            </header>

            <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex justify-center space-x-2 mb-4">
                    <TimeFilterButton value="thisMonth" label="Bulan Ini" />
                    <TimeFilterButton value="lastMonth" label="Bulan Lalu" />
                    <TimeFilterButton value="allTime" label="Semua" />
                </div>

                {chartData.totalSpending > 0 ? (
                    <>
                        <div className="relative h-64 w-full mx-auto mb-4">
                            <Doughnut data={chartData} options={chartOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-gray-500 text-sm">Total Pengeluaran</span>
                                <span className="text-2xl font-bold">{formatCurrency(chartData.totalSpending)}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold text-lg border-t pt-4">Rincian Kategori</h3>
                            {chartData.legendData.map(item => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-3">
                                        <CategoryIcon icon={item.icon} name={item.name} color={item.color} size="w-8 h-8"/>
                                        <span className="font-semibold">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency(item.total)}</p>
                                        <p className="text-gray-500">{((item.total / chartData.totalSpending) * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center border-t pt-6">
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading}
                                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-wait"
                            >
                                <SparklesIcon />
                                <span>Analisis dengan AI</span>
                            </button>
                        </div>

                        <AnalysisCard analysis={analysis} isLoading={isLoading} error={error} />
                    </>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500">Tidak ada data pengeluaran untuk periode ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
}