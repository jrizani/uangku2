// Izinkan server ini diakses dari mana saja (CORS)
const allowCors = fn => async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Atau ganti '*' dengan domain Vercel Anda untuk keamanan lebih
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    return await fn(req, res);
};

// Impor library
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Handler utama untuk permintaan
async function handler(req, res) {
    // Pastikan metode adalah POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { transactions, period, question, history = [] } = req.body;

        if (!transactions || transactions.length === 0) {
            return res.status(400).json({ error: 'Tidak ada data transaksi untuk dianalisis.' });
        }

        if (!question || question.trim().length === 0) {
            return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' });
        }

        const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);

        const normalizeCategoryName = (category) => {
            if (!category) return 'Tanpa Kategori';
            if (typeof category === 'string') return category;
            return category.name || category.id || 'Tanpa Kategori';
        };

        const normalizedTransactions = transactions.map(tx => ({
            id: tx.id || '',
            date: tx.date,
            type: tx.type,
            amount: Number(tx.amount) || 0,
            category: normalizeCategoryName(tx.category),
            text: tx.text || '',
            contactName: tx.contactName || '',
            walletId: tx.walletId || tx.fromWalletId || ''
        }));

        const totalIncome = normalizedTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpense = normalizedTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
        const netCashFlow = totalIncome - totalExpense;

        const aggregateByCategory = (list) => list.reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            return acc;
        }, {});

        const incomeByCategory = aggregateByCategory(normalizedTransactions.filter(tx => tx.type === 'income'));
        const expenseByCategory = aggregateByCategory(normalizedTransactions.filter(tx => tx.type === 'expense'));

        const sortedIncomeCategories = Object.entries(incomeByCategory).sort(([, a], [, b]) => b - a);
        const sortedExpenseCategories = Object.entries(expenseByCategory).sort(([, a], [, b]) => b - a);

        const largestIncome = sortedIncomeCategories[0] ? `${sortedIncomeCategories[0][0]} (${formatCurrency(sortedIncomeCategories[0][1])})` : '-';
        const largestExpense = sortedExpenseCategories[0] ? `${sortedExpenseCategories[0][0]} (${formatCurrency(sortedExpenseCategories[0][1])})` : '-';

        const formatLines = (entries) => entries
            .map(([name, total]) => `- ${name}: ${formatCurrency(total)}`)
            .join('\n');

        const incomeLines = sortedIncomeCategories.length ? formatLines(sortedIncomeCategories) : '- Tidak ada pemasukan pada periode ini.';
        const expenseLines = sortedExpenseCategories.length ? formatLines(sortedExpenseCategories) : '- Tidak ada pengeluaran pada periode ini.';

        const transactionsToShare = normalizedTransactions
            .slice()
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-120);

        const transactionLines = transactionsToShare
            .map(tx => {
                const date = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                const base = `${date} | ${tx.type.toUpperCase()} | ${tx.category} | ${formatCurrency(tx.amount)}`;
                const details = [tx.text ? `Catatan: ${tx.text}` : null, tx.contactName ? `Kontak: ${tx.contactName}` : null, tx.walletId ? `DompetID: ${tx.walletId}` : null]
                    .filter(Boolean)
                    .join(' | ');
                return details ? `${base} | ${details}` : base;
            })
            .join('\n');

        const historyLines = Array.isArray(history) ? history.slice(-10).map(msg => {
            const role = msg.role === 'assistant' ? 'Asisten' : 'Pengguna';
            return `${role}: ${msg.content}`;
        }).join('\n') : '';

        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Anda adalah asisten keuangan pribadi yang ramah, akurat, dan proaktif dari Indonesia. Gunakan data berikut untuk menjawab pertanyaan pengguna secara spesifik, selalu sertakan angka penting bila relevan.

Periode data: ${period || 'Semua Waktu'}
Total pemasukan: ${formatCurrency(totalIncome)}
Total pengeluaran: ${formatCurrency(totalExpense)}
Arus kas bersih: ${formatCurrency(netCashFlow)}
Kategori pemasukan terbesar: ${largestIncome}
Kategori pengeluaran terbesar: ${largestExpense}

Rincian pemasukan per kategori:
${incomeLines}

Rincian pengeluaran per kategori:
${expenseLines}

Daftar transaksi terbaru (maksimal ${transactionsToShare.length}):
${transactionLines || '- Tidak ada transaksi'}

Riwayat percakapan sejauh ini:
${historyLines || '(Belum ada percakapan sebelumnya)'}

Pertanyaan pengguna: ${question}

Instruksi:
- Jawab dalam bahasa Indonesia yang jelas dan mudah dipahami.
- Gunakan informasi numerik yang ada pada data. Jika jumlah diminta, sebutkan nominalnya.
- Jika data tidak tersedia, jelaskan dengan sopan dan tawarkan cara pengguna mendapatkannya.
- Akhiri dengan insight atau saran singkat bila sesuai.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        res.status(200).json({ reply: text });

    } catch (error) {
        console.error('Error dari Gemini API:', error);

        const message = typeof error?.message === 'string' ? error.message : '';
        const status = error?.status || error?.response?.status;

        if (status === 401 || status === 403 || /apikey|api key/i.test(message)) {
            return res.status(502).json({ error: 'Server tidak dapat menghubungi layanan Gemini. Periksa kembali GEMINI_API_KEY Anda.' });
        }

        res.status(500).json({ error: 'Gagal mendapatkan analisis dari AI. Terjadi kesalahan internal server.' });
    }
}

// Ekspor handler yang sudah dibungkus dengan CORS
module.exports = allowCors(handler);
