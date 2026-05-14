import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getBillingLineById } from '../../api/billingApi';
import '../../styles/Billing.css';

function fmtBLId(id) { return 'BL' + String(id).padStart(4, '0'); }
function fmtBKId(id) { if (!id) return '—'; return 'BK' + String(id).padStart(3, '0'); }
function fmtLDId(id) { if (!id) return '—'; return 'LD' + String(id).padStart(3, '0'); }
function fmtAmt(v) { return '₹' + (v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }); }

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#1a2b45', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function BillingLineView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bl, setBl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBillingLineById(id)
      .then((data) => setBl(data.billing || data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Layout>
      <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button className="btn-export" onClick={() => navigate('/billing/billing-lines')} style={{ flexShrink: 0, fontSize: 20, padding: '8px 12px' }}>←</button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2b45', margin: 0 }}>📋 Billing Line Details</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>View the details of the selected billing line.</p>
          </div>
        </div>

        {loading && <div className="empty-state">Loading billing line...</div>}
        {error   && <div className="error-banner">⚠️ {error}</div>}

        {!loading && !error && bl && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '8px 32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

            {/* ID badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 4px' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1d4ed8' }}>{fmtBLId(bl.billingLineID)}</span>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 8, fontSize: 12, fontWeight: 600, padding: '2px 10px' }}>Billing Line</span>
            </div>

            <div style={{ marginTop: 8 }}>
              <DetailRow label="BL ID"         value={fmtBLId(bl.billingLineID)} />
              <DetailRow label="Booking ID"    value={fmtBKId(bl.bookingID)} />
              <DetailRow label="Load ID"       value={fmtLDId(bl.loadID)} />
              <DetailRow label="Amount"        value={fmtAmt(bl.amount)} />
              <DetailRow label="Tariff Applied" value={bl.tariffApplied || '—'} />
              <DetailRow label="Notes"         value={bl.notes || '—'} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}