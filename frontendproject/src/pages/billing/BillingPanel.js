import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getAllInvoices, getAllTariffs, getAllBillingLines } from '../../api/billingApi';
import '../../styles/Billing.css';

export default function BillingPanel() {
  const [invoices,     setInvoices]     = useState([]);
  const [tariffs,      setTariffs]      = useState([]);
  const [billingLines, setBillingLines] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      getAllInvoices().catch(() => []),
      getAllTariffs().catch(() => []),
      getAllBillingLines().catch(() => []),
    ]).then(([inv, tar, lines]) => {
      setInvoices(inv);
      setTariffs(tar);
      setBillingLines(lines);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="billing-page">

        <div className="page-header">
          <div>
            <h1 className="page-title">Billing Panel</h1>
            <p className="page-subtitle">Manage tariffs, billing lines, and invoices for shipper accounts</p>
          </div>
        </div>

        <div className="billing-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total Invoices</div>
            <div className="stat-value">{loading ? '—' : invoices.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Billing Lines</div>
            <div className="stat-value">{loading ? '—' : billingLines.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Tariffs</div>
            <div className="stat-value stat-active">
              {loading ? '—' : tariffs.filter(t => (t.status || '').toLowerCase() === 'active').length}
            </div>
          </div>
        </div>

        <div className="billing-quick-grid">
          <Link to="/billing/invoices" className="quick-card">
            <div className="quick-card-icon" style={{ background: '#eff6ff' }}>
              {String.fromCodePoint(0x1F9FE)}
            </div>
            <div>
              <div className="quick-card-title">Invoices</div>
              <div className="quick-card-desc">View, generate &amp; manage shipper invoices</div>
            </div>
          </Link>
          <Link to="/billing/billing-lines" className="quick-card">
            <div className="quick-card-icon" style={{ background: '#f0fdf4' }}>
              {String.fromCodePoint(0x1F4C4)}
            </div>
            <div>
              <div className="quick-card-title">Billing Lines</div>
              <div className="quick-card-desc">Review &amp; reconcile billing entries per booking</div>
            </div>
          </Link>
          <Link to="/billing/tariffs" className="quick-card">
            <div className="quick-card-icon" style={{ background: '#fefce8' }}>
              {String.fromCodePoint(0x1F4B9)}
            </div>
            <div>
              <div className="quick-card-title">Tariffs</div>
              <div className="quick-card-desc">Manage rate cards, service types &amp; charges</div>
            </div>
          </Link>
        </div>

      </div>
    </Layout>
  );
}

