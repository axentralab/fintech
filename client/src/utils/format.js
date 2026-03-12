export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);
};
export const formatNumber = (num) => new Intl.NumberFormat().format(num);
export const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const formatPercent = (num) => `${num >= 0 ? '+' : ''}${parseFloat(num || 0).toFixed(2)}%`;
export const getPnLColor = (value) => value >= 0 ? '#10b981' : '#f43f5e';
export const truncate = (str, n = 30) => str?.length > n ? str.substring(0, n) + '...' : str;
