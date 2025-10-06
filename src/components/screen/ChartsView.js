import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {ArrowLeftIcon, ArrowRightIcon} from '../../utils/icons';
import { formatCurrency } from '../../utils/helpers';
import { CategoryIcon } from '../widget/CategoryIcon';

const ANALYSIS_ENDPOINT = process.env.REACT_APP_ANALYSIS_API_URL || '/api/analyze';

// Daftarkan elemen-elemen Chart.js yang akan kita gunakan
ChartJS.register(ArcElement, Tooltip, Legend);

export function ChartsView({ onBack, transactions, wallets = [] }) {
    const [displayMonth, setDisplayMonth] = useState(new Date()); // Date
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatError, setChatError] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const chartRef = useRef(null);
    const chatContainerRef = useRef(null);

    const walletNameMap = useMemo(() => {
        return wallets.reduce((acc, wallet) => {
            acc[wallet.id] = wallet.name;
            return acc;
        }, {});
    }, [wallets]);

    const transactionsInPeriod = useMemo(() => {
        return transactions.filter(tx => {
            if (!displayMonth) return true;

            const txDate = new Date(tx.date);
            const year = displayMonth.getFullYear();
            const month = displayMonth.getMonth();

            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);

            return txDate >= startOfMonth && txDate <= endOfMonth;
        });
    }, [transactions, displayMonth]);

    const expenseTransactions = useMemo(() => {
        return transactionsInPeriod.filter(tx => tx.type === 'expense');
    }, [transactionsInPeriod]);

    const categoryBreakdown = useMemo(() => {
        return expenseTransactions.reduce((acc, tx) => {
            const categoryId = tx.category.id;
            if (!acc[categoryId]) {
                acc[categoryId] = {
                    id: categoryId,
                    name: tx.category.name,
                    color: tx.category.color,
                    icon: tx.category.icon,
                    total: 0,
                    transactions: []
                };
            }
            acc[categoryId].total += tx.amount;
            acc[categoryId].transactions.push(tx);
            return acc;
        }, {});
    }, [expenseTransactions]);

    const sortedCategories = useMemo(() => {
        return Object.values(categoryBreakdown).sort((a, b) => b.total - a.total);
    }, [categoryBreakdown]);

    useEffect(() => {
        if (sortedCategories.length === 0) {
            setSelectedCategoryId(null);
            return;
        }
        const exists = sortedCategories.some(cat => cat.id === selectedCategoryId);
        if (!exists) {
            setSelectedCategoryId(sortedCategories[0].id);
        }
    }, [sortedCategories, selectedCategoryId]);

    const chartData = useMemo(() => {
        return {
            labels: sortedCategories.map(d => d.name),
            datasets: [{
                data: sortedCategories.map(d => d.total),
                backgroundColor: sortedCategories.map(d => d.color),
                borderColor: '#fff',
                borderWidth: 2,
            }],
            legendData: sortedCategories,
            totalSpending: sortedCategories.reduce((sum, item) => sum + item.total, 0),
        };
    }, [sortedCategories]);

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

    const handleChartClick = (event) => {
        const chart = chartRef.current;
        if (!chart) return;
        const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
        if (!elements.length) return;
        const index = elements[0].index;
        const legendItem = chartData.legendData[index];
        if (legendItem) {
            setSelectedCategoryId(legendItem.id);
        }
    };

    const changeMonth = (amount) => {
        // Jika sedang di 'Semua Waktu', mulai dari bulan sekarang
        const baseDate = displayMonth || new Date();
        const newDate = new Date(baseDate);
        newDate.setMonth(newDate.getMonth() + amount);
        setDisplayMonth(newDate);
    };

    // Cek apakah bulan yang ditampilkan adalah bulan saat ini
    const isCurrentMonth = displayMonth &&
        new Date().getFullYear() === displayMonth.getFullYear() &&
        new Date().getMonth() === displayMonth.getMonth();

    const selectedCategory = selectedCategoryId ? sortedCategories.find(cat => cat.id === selectedCategoryId) : null;
    const selectedCategoryTransactions = selectedCategoryId ? categoryBreakdown[selectedCategoryId]?.transactions || [] : [];
    const selectedPercentage = selectedCategory && chartData.totalSpending > 0
        ? ((selectedCategory.total / chartData.totalSpending) * 100).toFixed(1)
        : 0;
    const selectedAverage = selectedCategoryTransactions.length > 0
        ? selectedCategory.total / selectedCategoryTransactions.length
        : 0;

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages, isChatLoading]);

    const handleSendMessage = async (event) => {
        event.preventDefault();
        if (!chatInput.trim()) return;

        const message = { role: 'user', content: chatInput.trim() };
        const updatedHistory = [...chatMessages, message];

        setChatMessages(updatedHistory);
        setChatInput('');
        setChatError('');
        setIsChatLoading(true);

        try {
            const response = await fetch(ANALYSIS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: message.content,
                    history: updatedHistory,
                    transactions: transactionsInPeriod,
                    period: displayMonth ? displayMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'Semua Waktu'
                })
            });

            const rawText = await response.text();
            let data;
            try {
                data = rawText ? JSON.parse(rawText) : {};
            } catch (parseError) {
                console.error('Gagal mengurai respons analisis:', parseError, rawText);
                data = {};
            }

            if (!response.ok || data.error) {
                setChatError(data?.error || 'Gagal mendapatkan respon dari server.');
                return;
            }

            if (data.reply) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }
        } catch (err) {
            console.error(err);
            setChatError('Tidak dapat terhubung ke layanan AI. Pastikan server backend berjalan.');
        } finally {
            setIsChatLoading(false);
        }
    };

    const showBackButton = typeof onBack === 'function';

    return (
        <div className="container mx-auto max-w-lg p-4 pb-24">
            <header className={`flex items-center my-6 gap-2 ${showBackButton ? '' : 'justify-start'}`}>
                {showBackButton && <button onClick={onBack} className="p-2"><ArrowLeftIcon /></button>}
                <h1 className="text-2xl font-bold">Grafik Pengeluaran</h1>
            </header>

            <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeftIcon /></button>
                    <div className="text-center">
                        <p className="font-bold text-lg">
                            {displayMonth ? displayMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'Semua Waktu'}
                        </p>
                        <button
                            onClick={() => setDisplayMonth(displayMonth ? null : new Date())}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {displayMonth ? 'Tampilkan Semua' : 'Pilih Bulan'}
                        </button>
                    </div>
                    <button onClick={() => changeMonth(1)} disabled={isCurrentMonth} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"><ArrowRightIcon /></button>
                </div>

                {chartData.totalSpending > 0 ? (
                    <>
                        <div className="relative h-64 w-full mx-auto mb-4">
                            <Doughnut ref={chartRef} data={chartData} options={chartOptions} onClick={handleChartClick} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-gray-500 text-sm">Total Pengeluaran</span>
                                <span className="text-2xl font-bold">{formatCurrency(chartData.totalSpending)}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold text-lg border-t pt-4">Rincian Kategori</h3>
                            {chartData.legendData.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedCategoryId(item.id)}
                                    className={`w-full flex items-center justify-between text-sm rounded-lg px-3 py-2 transition-colors ${selectedCategoryId === item.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-100'}`}
                                >
                                    <div className="flex items-center space-x-3 text-left">
                                        <CategoryIcon icon={item.icon} name={item.name} color={item.color} size="w-8 h-8"/>
                                        <div>
                                            <span className="font-semibold block">{item.name}</span>
                                            <span className="text-xs text-gray-500">{item.transactions.length} transaksi</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency(item.total)}</p>
                                        <p className="text-gray-500">{((item.total / chartData.totalSpending) * 100).toFixed(1)}%</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {selectedCategory && (
                            <div className="mt-6 border rounded-xl p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <CategoryIcon icon={selectedCategory.icon} name={selectedCategory.name} color={selectedCategory.color} size="w-10 h-10" />
                                        <div>
                                            <h4 className="font-bold text-lg">{selectedCategory.name}</h4>
                                            <p className="text-sm text-gray-500">{selectedCategoryTransactions.length} transaksi • {selectedPercentage}% dari total</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="text-xl font-bold">{formatCurrency(selectedCategory.total)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <p className="text-gray-500">Rata-rata</p>
                                        <p className="font-semibold">{formatCurrency(selectedAverage || 0)}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <p className="text-gray-500">Transaksi Terbesar</p>
                                        <p className="font-semibold">{formatCurrency(Math.max(...selectedCategoryTransactions.map(tx => tx.amount), 0))}</p>
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto divide-y text-sm">
                                    {selectedCategoryTransactions.map(tx => (
                                        <div key={tx.id} className="py-2 flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{tx.text}</p>
                                                <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-red-500">{formatCurrency(tx.amount)}</p>
                                                {tx.walletId && <p className="text-xs text-gray-500">Dompet: {walletNameMap[tx.walletId] || 'Tidak diketahui'}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 border-t pt-6">
                            <h3 className="font-bold text-lg mb-3">Asisten Finansial</h3>
                            <div
                                ref={chatContainerRef}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-3 h-60 overflow-y-auto space-y-3"
                            >
                                {chatMessages.length === 0 && !isChatLoading && (
                                    <p className="text-sm text-gray-500">
                                        Tanyakan apa saja tentang pengeluaran atau pemasukan Anda pada periode ini.
                                        Contoh: "Kategori apa yang paling besar bulan ini?" atau "Berapa selisih pemasukan dan pengeluaran saya?"
                                    </p>
                                )}
                                {chatMessages.map((message, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-lg px-3 py-2 text-sm ${message.role === 'user' ? 'bg-blue-600 text-white self-end ml-auto max-w-[85%]' : 'bg-white text-gray-700 shadow-sm mr-auto max-w-[90%]'}`}
                                    >
                                        {message.content}
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="bg-white text-gray-500 text-sm px-3 py-2 rounded-lg shadow-sm inline-block">Asisten sedang menganalisis…</div>
                                )}
                            </div>
                            {chatError && (
                                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{chatError}</div>
                            )}
                            <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Tulis pertanyaan Anda..."
                                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    disabled={isChatLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isChatLoading || !chatInput.trim()}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Kirim
                                </button>
                            </form>
                            <p className="mt-2 text-xs text-gray-500">Asisten menggunakan seluruh transaksi yang tersimpan pada periode ini, termasuk pemasukan, utang, dan piutang.</p>
                        </div>
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
