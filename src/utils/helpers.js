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