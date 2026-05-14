import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getTariffById } from '../../api/billingApi';
import '../../styles/Billing.css';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'active')   return 'status-active';
  if (s === 'inactive') return 'status-inactive';
  return 'status-default';
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#1a2b45', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function TariffView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tariff, setTariff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTariffById(id)
      .then(setTariff)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Layout>
      <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button className="btn-export" onClick={() => navigate('/billing/tariffs')} style={{ flexShrink: 0, fontSize: 20, padding: '8px 12px' }}>←</button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2b45', margin: 0 }}>🏷️ Tariff Details</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>View the details of the selected tariff.</p>
          </div>
        </div>

        {loading && <div className="empty-state">Loading tariff...</div>}
        {error   && <div className="error-banner">⚠️ {error}</div>}

        {!loading && !error && tariff && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '8px 32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

            {/* ID badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 4px' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#d97706' }}>T{String(tariff.tariffID).padStart(3, '0')}</span>
              <span style={{ background: '#fef3c7', color: '#d97706', borderRadius: 8, fontSize: 12, fontWeight: 600, padding: '2px 10px' }}>Tariff</span>
            </div>

            <div style={{ marginTop: 8 }}>
              <DetailRow label="Tariff ID"      value={`T${String(tariff.tariffID).padStart(3, '0')}`} />
              <DetailRow label="Service Type"   value={tariff.serviceType || '—'} />
              <DetailRow label="Rate / kg"      value={`₹${tariff.ratePerKg}/kg`} />
              <DetailRow label="Rate / m³"      value={`₹${tariff.ratePerM3}/m³`} />
              <DetailRow label="Min Charge"     value={`₹${tariff.minCharge?.toLocaleString('en-IN')}`} />
              <DetailRow label="Status"         value={<span className={`status-badge ${getStatusClass(tariff.status)}`}>{tariff.status || '—'}</span>} />
              <DetailRow label="Effective From" value={fmtDate(tariff.effectiveFrom)} />
              <DetailRow label="Effective To"   value={fmtDate(tariff.effectiveTo)} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}