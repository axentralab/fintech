import { useState } from 'react';
import Icon from '../components/ui/Icon';

const MOCK_TX = [
  { id: '1', description: 'Salary Deposit', merchant: 'Employer Inc', type: 'income', category: 'salary', amount: 8500, currency: 'USD', date: '2024-01-15', status: 'completed', tags: ['salary', 'recurring'] },
  { id: '2', description: 'AWS Services', merchant: 'Amazon Web Services', type: 'expense', category: 'utilities', amount: -234.50, currency: 'USD', date: '2024-01-14', status: 'completed', tags: ['cloud', 'business'] },
  { id: '3', description: 'BTC Purchase', merchant: 'Coinbase', type: 'investment', category: 'investment', amount: -2000, currency: 'USD', date: '2024-01-13', status: 'completed', tags: ['crypto'] },
  { id: '4', description: 'Netflix Subscription', merchant: 'Netflix', type: 'expense', category: 'entertainment', amount: -15.99, currency: 'USD', date: '2024-01-12', status: 'completed', tags: ['subscription'] },
  { id: '5', description: 'Freelance Payment', merchant: 'Client XYZ', type: 'income', category: 'freelance', amount: 3200, currency: 'USD', date: '2024-01-11', status: 'completed', tags: ['freelance'] },
  { id: '6', description: 'Grocery Shopping', merchant: 'Whole Foods', type: 'expense', category: 'food', amount: -187.40, currency: 'USD', date: '2024-01-11', status: 'completed', tags: ['food'] },
  { id: '7', description: 'Dividend Payment', merchant: 'Fidelity', type: 'income', category: 'investment', amount: 420, currency: 'USD', date: '2024-01-10', status: 'completed', tags: ['dividend'] },
  { id: '8', description: 'Uber Rides', merchant: 'Uber', type: 'expense', category: 'transport', amount: -58.20, currency: 'USD', date: '2024-01-09', status: 'pending', tags: ['transport'] },
  { id: '9', description: 'Adobe Creative', merchant: 'Adobe', type: 'expense', category: 'utilities', amount: -54.99, currency: 'USD', date: '2024-01-08', status: 'completed', tags: ['subscription', 'design'] },
  { id: '10', description: 'Wire Transfer', merchant: 'Bank Transfer', type: 'transfer', category: 'other', amount: -5000, currency: 'USD', date: '2024-01-07', status: 'completed', tags: ['transfer'] },
];

const CATEGORIES = ['all', 'salary', 'freelance', 'investment', 'food', 'transport', 'utilities', 'entertainment', 'other'];
const TYPES = ['all', 'income', 'expense', 'transfer', 'investment'];
const STATUSES = ['all', 'completed', 'pending', 'failed'];

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n));

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = MOCK_TX.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (catFilter !== 'all' && tx.category !== catFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase()) && !tx.merchant.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalIncome = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selectAll = () => setSelected(filtered.map(t => t.id));
  const clearSelect = () => setSelected([]);

  const handleExportCSV = () => {
    const rows = filtered.map(t => `"${t.date}","${t.type}","${t.category}","${t.amount}","${t.currency}","${t.description}","${t.merchant}","${t.status}","${t.tags.join(';')}"`);
    const csv = ['Date,Type,Category,Amount,Currency,Description,Merchant,Status,Tags', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
  };

  const statusBadge = (s) => ({ completed: 'badge-success', pending: 'badge-warning', failed: 'badge-danger', cancelled: 'badge-neutral' }[s] || 'badge-neutral');
  const typeColor = { income: 'var(--success)', expense: 'var(--danger)', transfer: 'var(--info)', investment: 'var(--warning)' };

  return (
    <div className="section-gap page-enter">
      {/* Summary Bar */}
      <div className="grid-3">
        {[
          { label: 'Total Incoming', value: totalIncome, color: 'var(--success)', icon: 'arrowDown' },
          { label: 'Total Outgoing', value: totalExpense, color: 'var(--danger)', icon: 'arrowUp' },
          { label: 'Net', value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'var(--success)' : 'var(--danger)', icon: 'trending' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <div className="flex-between">
              <div>
                <div className="card-title">{s.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: s.color, marginTop: 4 }}>
                  {s.value >= 0 ? '' : '-'}{fmt(s.value)}
                </div>
              </div>
              <Icon name={s.icon} size={22} color={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Icon name="search" size={14} color="var(--text-muted)" />
            <input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select className="input" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select className="input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <div className="flex gap-8">
            <button className="btn btn-sm btn-secondary" onClick={handleExportCSV}>
              <Icon name="download" size={13} /> CSV
            </button>
            <button className="btn btn-sm btn-secondary">
              <Icon name="download" size={13} /> PDF
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => setShowAddModal(true)}>
              <Icon name="plus" size={13} /> Add
            </button>
          </div>
        </div>

        {/* Selection bar */}
        {selected.length > 0 && (
          <div style={{ padding: '10px 20px', background: 'rgba(37,99,235,0.08)', borderBottom: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--brand-secondary)' }}>{selected.length} selected</span>
            <button className="btn btn-xs btn-ghost" onClick={clearSelect}>Clear</button>
            <button className="btn btn-xs btn-danger"><Icon name="trash" size={12} /> Delete Selected</button>
          </div>
        )}

        {/* Table */}
        <div className="table-wrap" style={{ padding: '0 0 4px' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" onChange={e => e.target.checked ? selectAll() : clearSelect()} checked={selected.length === filtered.length && filtered.length > 0} />
                </th>
                <th>Description</th>
                <th>Type</th>
                <th>Category</th>
                <th>Date</th>
                <th>Tags</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <input type="checkbox" checked={selected.includes(tx.id)} onChange={() => toggleSelect(tx.id)} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{tx.description}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{tx.merchant}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', color: typeColor[tx.type], letterSpacing: '0.06em' }}>{tx.type}</span>
                  </td>
                  <td><span className="badge badge-neutral">{tx.category}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{tx.date}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {tx.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--brand-secondary)', borderRadius: 12, padding: '1px 6px', fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>#{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td><span className={`badge ${statusBadge(tx.status)}`}>{tx.status}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: tx.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {tx.amount > 0 ? '+' : '-'}{fmt(tx.amount)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-icon btn-ghost btn-xs"><Icon name="edit" size={12} /></button>
                      <button className="btn btn-icon btn-danger btn-xs"><Icon name="trash" size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Showing {filtered.length} of {MOCK_TX.length} transactions
          </span>
          <div className="flex gap-8">
            <button className="btn btn-sm btn-ghost">← Prev</button>
            <button className="btn btn-sm btn-ghost">Next →</button>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Transaction</div>
            <button className="modal-close" onClick={() => setShowAddModal(false)}><Icon name="x" size={14} /></button>
            <div className="section-gap" style={{ gap: 14 }}>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select className="input"><option>income</option><option>expense</option><option>transfer</option><option>investment</option></select>
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select className="input">{CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}</select>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <input className="input" placeholder="What was this for?" />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Amount</label>
                  <input className="input" type="number" placeholder="0.00" />
                </div>
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input className="input" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Tags (comma separated)</label>
                <input className="input" placeholder="e.g. business, recurring" />
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary"><Icon name="plus" size={14} /> Add Transaction</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
