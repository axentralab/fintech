import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/format';

const MOCK_TRANSACTIONS = [
  { _id: '1', description: 'Client Payment Q4', type: 'income', category: 'Revenue', amount: 12000, currency: 'USD', status: 'completed', date: new Date('2024-01-15'), tags: ['client', 'q4'], merchant: 'Acme Corp' },
  { _id: '2', description: 'AWS Infrastructure', type: 'expense', category: 'Technology', amount: 2400, currency: 'USD', status: 'completed', date: new Date('2024-01-14'), tags: ['cloud', 'ops'], merchant: 'Amazon' },
  { _id: '3', description: 'Bitcoin Purchase', type: 'investment', category: 'Crypto', amount: 5000, currency: 'USD', status: 'completed', date: new Date('2024-01-13'), tags: ['crypto', 'btc'], merchant: 'Binance' },
  { _id: '4', description: 'Office Rent', type: 'expense', category: 'Operations', amount: 3500, currency: 'USD', status: 'pending', date: new Date('2024-01-12'), tags: ['rent', 'ops'], merchant: 'Landlord LLC' },
  { _id: '5', description: 'Consulting Fee', type: 'income', category: 'Services', amount: 8500, currency: 'USD', status: 'completed', date: new Date('2024-01-11'), tags: ['consulting'], merchant: 'Tech Client' },
  { _id: '6', description: 'Shopify Revenue', type: 'income', category: 'E-commerce', amount: 3200, currency: 'USD', status: 'completed', date: new Date('2024-01-10'), tags: ['ecom', 'shopify'], merchant: 'Shopify' },
  { _id: '7', description: 'Marketing Spend', type: 'expense', category: 'Marketing', amount: 1800, currency: 'USD', status: 'completed', date: new Date('2024-01-09'), tags: ['ads', 'marketing'], merchant: 'Meta Ads' },
  { _id: '8', description: 'AAPL Dividend', type: 'income', category: 'Dividends', amount: 840, currency: 'USD', status: 'completed', date: new Date('2024-01-08'), tags: ['dividend', 'stocks'], merchant: 'Apple Inc' },
  { _id: '9', description: 'Stripe Payout', type: 'income', category: 'Revenue', amount: 6700, currency: 'USD', status: 'completed', date: new Date('2024-01-07'), tags: ['stripe', 'payout'], merchant: 'Stripe' },
  { _id: '10', description: 'Software Licenses', type: 'expense', category: 'Technology', amount: 980, currency: 'USD', status: 'completed', date: new Date('2024-01-06'), tags: ['software', 'tools'], merchant: 'Various' },
];

const typeColor = { income: '#10b981', expense: '#f43f5e', investment: '#8b5cf6', transfer: '#06b6d4' };

function exportCSV(data) {
  const csv = ['Date,Description,Type,Category,Amount,Currency,Status,Tags,Merchant',
    ...data.map(t => `${formatDate(t.date)},"${t.description}",${t.type},${t.category},${t.amount},${t.currency},${t.status},"${t.tags.join(';')}","${t.merchant}"`)
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
}

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const allTags = [...new Set(MOCK_TRANSACTIONS.flatMap(t => t.tags))];

  const filtered = MOCK_TRANSACTIONS.filter(t => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (selectedTags.length && !selectedTags.some(tag => t.tags.includes(tag))) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.merchant.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleTag = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Transactions</div>
        <div className="page-sub">{filtered.length} transactions found</div>
      </div>

      {/* Filters */}
      <div className="card mb-14">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" style={{ width: 220 }} placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-select" style={{ width: 140 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="investment">Investment</option>
            <option value="transfer">Transfer</option>
          </select>
          <select className="form-select" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <div style={{ flex: 1 }} />
          <button className="btn btn-outline btn-sm" onClick={() => exportCSV(filtered)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            CSV
          </button>
          <button className="btn btn-outline btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            PDF
          </button>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', alignSelf: 'center' }}>Tags:</span>
          {allTags.map(tag => (
            <button key={tag} className={`tag ${selectedTags.includes(tag) ? 'active' : ''}`} onClick={() => toggleTag(tag)}>
              #{tag}
            </button>
          ))}
          {selectedTags.length > 0 && <button className="tag" onClick={() => setSelectedTags([])} style={{ color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }}>clear ×</button>}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Merchant</th>
              <th>Type</th>
              <th>Category</th>
              <th>Tags</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(tx => (
              <tr key={tx._id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(tx.date)}</td>
                <td style={{ fontWeight: 500 }}>{tx.description}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{tx.merchant}</td>
                <td><span className="badge" style={{ background: `${typeColor[tx.type]}20`, color: typeColor[tx.type] }}>{tx.type}</span></td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{tx.category}</td>
                <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{tx.tags.slice(0, 2).map(t => <span key={t} className="tag" style={{ padding: '1px 5px', fontSize: '0.6rem' }}>#{t}</span>)}</div></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: tx.type === 'income' ? '#10b981' : tx.type === 'expense' ? '#f43f5e' : 'var(--text-primary)' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
                <td><span className={`badge ${tx.status === 'completed' ? 'badge-emerald' : tx.status === 'pending' ? 'badge-amber' : 'badge-rose'}`}>{tx.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
