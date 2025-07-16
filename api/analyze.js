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
        const { transactions, period } = req.body;

        if (!transactions || transactions.length === 0) {
            return res.status(400).json({ error: 'Tidak ada data transaksi untuk dianalisis.' });
        }

        // 1. Kategorikan transaksi untuk analisis yang lebih dalam.
        //    Kita pisahkan pengeluaran konsumtif dari pergerakan uang untuk utang/piutang.
        const consumptionExpenses = transactions.filter(t =>
            t.type === 'expense' &&
            !['Piutang', 'Pembayaran Utang'].includes(t.category.name)
        );

        const realIncome = transactions.filter(t =>
            t.type === 'income' &&
            !['Utang', 'Penerimaan Piutang'].includes(t.category.name)
        );

        const debtPayments = transactions.filter(t => t.category.name === 'Pembayaran Utang').reduce((sum, t) => sum + t.amount, 0);
        const newLoansToOthers = transactions.filter(t => t.category.name === 'Piutang').reduce((sum, t) => sum + t.amount, 0);

        // 2. Kalkulasi metrik utama untuk diberikan ke AI.
        const totalRealIncome = realIncome.reduce((sum, t) => sum + t.amount, 0);
        const totalConsumption = consumptionExpenses.reduce((sum, t) => sum + t.amount, 0);
        const netSavings = totalRealIncome - totalConsumption;
        const savingsRate = totalRealIncome > 0 ? ((netSavings / totalRealIncome) * 100).toFixed(1) : 0;

        // 3. Rincian pengeluaran konsumtif.
        const expenseByCategory = consumptionExpenses.reduce((acc, t) => {
            const categoryName = t.category.name;
            acc[categoryName] = (acc[categoryName] || 0) + t.amount;
            return acc;
        }, {});

        const top5Expenses = Object.entries(expenseByCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, total]) => `- ${name}: Rp ${total.toLocaleString('id-ID')} (${totalConsumption > 0 ? ((total / totalConsumption) * 100).toFixed(1) : 0}%)`)
            .join('\n');

        // Inisialisasi Model Gemini menggunakan Environment Variable
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Anda adalah seorang penasihat keuangan pribadi dari Indonesia yang sangat cerdas, jeli, dan suportif.
            Tugas Anda adalah menganalisis data keuangan klien untuk periode "${period}" dan memberikan wawasan yang mendalam.

            PENTING: Transaksi "Piutang" adalah uang yang klien pinjamkan ke orang lain (ini adalah aset, bukan pengeluaran konsumtif). "Pembayaran Utang" adalah pembayaran cicilan utang. JANGAN analisis kedua kategori ini sebagai bagian dari kebiasaan belanja. Fokuskan analisis pengeluaran pada pos-pos konsumtif.

            Berikut adalah data keuangan klien:
            - Total Pemasukan Bersih (di luar pinjaman): Rp ${totalRealIncome.toLocaleString('id-ID')}
            - Total Pengeluaran Konsumtif (belanja, makan, dll.): Rp ${totalConsumption.toLocaleString('id-ID')}
            - Sisa Uang (Net Savings): Rp ${netSavings.toLocaleString('id-ID')}
            - Tingkat Tabungan (Savings Rate): ${savingsRate}%
            - Total Uang untuk Membayar Utang: Rp ${debtPayments.toLocaleString('id-ID')}
            - Total Uang yang Dipinjamkan ke Orang Lain (Piutang Baru): Rp ${newLoansToOthers.toLocaleString('id-ID')}

            5 Kategori Pengeluaran Konsumtif Teratas:
            ${top5Expenses || "Tidak ada pengeluaran konsumtif."}

            Berikan analisis dalam format JSON yang ketat tanpa markdown (tanpa \`\`\`json ... \`\`\`). Strukturnya harus sebagai berikut:
            {
                "summary": "Ringkasan kondisi keuangan dalam 2-3 kalimat yang tajam dan jelas. Sebutkan angka kunci seperti sisa uang atau tingkat tabungan.",
                "financial_health_score": "Beri skor kesehatan finansial dari 1 hingga 100, dengan penjelasan singkat mengapa skor itu diberikan.",
                "key_observation": "Satu observasi paling penting dari data. Misalnya, 'Sebagian besar pengeluaran Anda ternyata terfokus pada kategori Transportasi, mencapai 45% dari total belanja.' atau 'Tingkat tabungan Anda sebesar 30% sangat sehat.'",
                "good_points": ["Sebutkan 1-2 hal positif secara spesifik. Contoh: 'Alokasi dana untuk membayar utang menunjukkan komitmen finansial yang baik.' atau 'Pemasukan Anda jauh lebih besar dari pengeluaran konsumtif.'"],
                "points_to_improve": ["Sebutkan 1-2 area yang paling potensial untuk ditingkatkan, fokus pada kategori pengeluaran terbesar. Contoh: 'Pengeluaran untuk Makanan dan Minuman adalah pos terbesar, mungkin ada ruang untuk efisiensi di sini.'"],
                "suggestion": "Berikan satu saran yang sangat konkret, praktis, dan bisa langsung diterapkan. Contoh: 'Coba alokasikan budget mingguan sebesar Rp xxx.xxx untuk kategori Makanan, dan lacak peningkatannya minggu depan.' atau 'Mengingat sisa uang yang cukup besar, pertimbangkan untuk mulai menyisihkan 10% ke rekening investasi atau dana darurat.'"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanedText);

        res.status(200).json(analysis);

    } catch (error) {
        console.error('Error dari Gemini API:', error);
        res.status(500).json({ error: 'Gagal mendapatkan analisis dari AI. Terjadi kesalahan internal server.' });
    }
}

// Ekspor handler yang sudah dibungkus dengan CORS
module.exports = allowCors(handler);