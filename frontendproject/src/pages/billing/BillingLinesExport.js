import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getAllBillingLines } from '../../api/billingApi';
import '../../styles/Billing.css';

function fmtBLId(id) { return id ? `BL${String(id).padStart(3, '0')}` : '—'; }
function fmtBKId(id) { return id ? `BK${String(id).padStart(3, '0')}` : '—'; }

export default function BillingLinesExport() {
  const navigate = useNavigate();
  const [lines,    setLines]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [exported, setExported] = useState(false);

  useEffect(() => {
    getAllBillingLines()
      .then(setLines)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    const headers = ['billingLineID', 'bookingID', 'loadID', 'amount', 'tariffApplied', 'notes'];
    const rows = lines.map(r => {
      const bl = r.billing || r;
      return [
        bl.billingLineID ?? '',
        bl.bookingID ?? '',
        bl.loadID ?? '',
        bl.amount ?? '',
        bl.tariffApplied ?? '',
        bl.notes ?? '',
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `billing_lines_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  return (
    <Layout>
      <div className="billing-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">📤 Export Billing Lines</h1>
            <p className="page-subtitle">Download all billing entries as a CSV file</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/billing/billing-lines')}>← Back</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Summary card */}
        <div className="import-tip-card">
          <span>📊 {loading ? 'Loading…' : `${lines.length} billing line(s) ready to export`}</span>
          <button
            className="btn-add-new"
            style={{ fontSize: 13, padding: '8px 20px' }}
            onClick={handleExport}
            disabled={loading || lines.length === 0}
          >
            ⬇ Download CSV
          </button>
        </div>

        {exported && (
          <div className="import-result-card import-result-success" style={{ marginBottom: 16 }}>
            <div className="import-result-title">✅ Export successful — check your downloads.</div>
          </div>
        )}

        {/* Preview */}
        {!loading && lines.length > 0 && (
          <div className="table-section">
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a2b45', margin: '0 0 12px' }}>
              Preview — {lines.length} rows
            </h2>
            <div className="table-wrapper">
              <table className="billing-table">
                <thead>
                  <tr><th>BL ID</th><th>Booking ID</th><th>Load ID</th><th>Amount</th><th>Tariff</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {lines.map((r, i) => {
                    const bl = r.billing || r;
                    return (
                      <tr key={i}>
                        <td className="billing-id-cell">{fmtBLId(bl.billingLineID)}</td>
                        <td>{fmtBKId(bl.bookingID)}</td>
                        <td>{bl.loadID || '—'}</td>
                        <td className="amount-cell">₹{(bl.amount || 0).toLocaleString()}</td>
                        <td><span className="rate-chip">{bl.tariffApplied || '—'}</span></td>
                        <td style={{ color: '#94a3b8', fontSize: 12 }}>{bl.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && lines.length === 0 && !error && (
          <div className="empty-state">No billing lines found to export.</div>
        )}
      </div>
    </Layout>
  );
}
