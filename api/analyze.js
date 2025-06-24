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

        // Inisialisasi Model Gemini menggunakan Environment Variable
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Memformat data untuk prompt AI
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        const expenseByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                const categoryName = t.category.name;
                acc[categoryName] = (acc[categoryName] || 0) + t.amount;
                return acc;
            }, {});

        const expenseDetails = Object.entries(expenseByCategory)
            .map(([name, total]) => `- ${name}: Rp ${total.toLocaleString('id-ID')}`)
            .join('\n');

        const prompt = `
            Anda adalah seorang penasihat keuangan pribadi yang cerdas, ramah, dan memberikan saran praktis berbahasa Indonesia.
            Analisis data keuangan berikut untuk periode "${period}":

            Total Pemasukan: Rp ${income.toLocaleString('id-ID')}
            Total Pengeluaran: Rp ${expense.toLocaleString('id-ID')}
            Sisa Uang: Rp ${(income - expense).toLocaleString('id-ID')}

            Rincian Pengeluaran per Kategori:
            ${expenseDetails || "Tidak ada pengeluaran."}
            
            Berikan analisis dalam format JSON. Strukturnya harus sebagai berikut:
            {
                "summary": "Ringkasan singkat kondisi keuangan dalam 1-2 kalimat.",
                "good_points": ["Satu atau dua poin positif, misalnya sisa uang yang baik atau pengeluaran terkendali."],
                "points_to_improve": ["Satu atau dua area pengeluaran terbesar atau pos yang bisa dihemat."],
                "suggestion": "Satu saran konkret dan praktis yang bisa langsung diterapkan untuk meningkatkan kesehatan finansial berdasarkan data yang ada."
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
        res.status(500).json({ error: 'Gagal mendapatkan analisis dari AI.' });
    }
}

// Ekspor handler yang sudah dibungkus dengan CORS
module.exports = allowCors(handler);