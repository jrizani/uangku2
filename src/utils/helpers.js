export const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
}).format(amount);
export const getTodayISO = () => new Date().toISOString().split('T')[0];
export const createId = () => crypto.randomUUID();
export const groupTransactionsByDate = (transactions) => {
    return transactions.reduce((acc, tx) => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(tx);
        return acc;
    }, {});
};
export const calculateDailyTotal = (transactions) => {
    return transactions.reduce((total, tx) => {
        if (tx.type === 'income') {
            return total + tx.amount;
        } else if (tx.type === 'expense') {
            return total - tx.amount;
        }
        return total;
    }, 0);
};

export const materialColors = [
    '#ef5350', '#EC407A', '#AB47BC', '#7E57C2', '#5C6BC0', '#42A5F5',
    '#29B6F6', '#26C6DA', '#26A69A', '#66BB6A', '#9CCC65', '#D4E157',
    '#FFEE58', '#FFCA28', '#FFA726', '#FF7043', '#8D6E63', '#BDBDBD', '#78909C'
];

export const getRandomColor = () => {
    return materialColors[Math.floor(Math.random() * materialColors.length)];
};