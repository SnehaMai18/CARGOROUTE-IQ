import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getInvoiceById, updateInvoice } from '../../api/billingApi';
import '../../styles/Billing.css';

const STATUS_OPTIONS = ['Pending', 'Paid', 'Overdue', 'Cancelled', 'Draft', 'Issued'];

function fmtInvId(id) { return `INV${String(id).padStart(4, '0')}`; }

function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function fmtDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtCurrency(val) {
  if (val == null) return '—';
  return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'paid')      return 'status-paid';
  if (s === 'pending')   return 'status-pending';
  if (s === 'overdue')   return 'status-overdue';
  if (s === 'cancelled') return 'status-cancelled';
  if (s === 'issued')    return 'status-issued';
  if (s === 'draft')     return 'status-draft';
  return 'status-default';
}

function parseLinesJSON(json) {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function InvoiceDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Status update
  const [newStatus,  setNewStatus]  = useState('');
  const [updating,   setUpdating]   = useState(false);
  const [updateMsg,  setUpdateMsg]  = useState('');
  const [updateErr,  setUpdateErr]  = useState('');

  useEffect(() => {
    setLoading(true);
    getInvoiceById(id)
      .then((d) => {
        setData(d);
        setNewStatus(d.invoice?.status || 'Pending');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!data) return;
    setUpdating(true);
    setUpdateMsg('');
    setUpdateErr('');
    try {
      const inv = data.invoice;
      await updateInvoice(inv.invoiceID, { ...inv, status: newStatus });
      setData((prev) => ({ ...prev, invoice: { ...prev.invoice, status: newStatus } }));
      setUpdateMsg(`Status updated to "${newStatus}".`);
    } catch (e) {
      setUpdateErr(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout>
        <div className="billing-page">
          <div className="empty-state">Loading invoice…</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="billing-page">
          <div className="error-banner">⚠️ {error}</div>
          <button className="btn-secondary" onClick={() => navigate('/billing/invoices')}>
            ← Back to Invoices
          </button>
        </div>
      </Layout>
    );
  }

  const inv     = data?.invoice || {};
  const shipper = data?.shipper || {};
  const lines   = parseLinesJSON(inv.linesJSON);

  return (
    <Layout>
      <div className="billing-page invoice-detail-page">

        {/* Page header */}
        <div className="detail-page-header">
          <button className="back-btn" onClick={() => navigate('/billing/invoices')} title="Back">
            ←
          </button>
          <div>
            <div className="invoice-id-display">{fmtInvId(inv.invoiceID)}</div>
            <div className="invoice-meta">
              Issued {fmtDate(inv.issuedAt)} &nbsp;·&nbsp;
              Shipper: <strong>{shipper.name || `#${inv.shipperID}`}</strong>
            </div>
          </div>
          <span className={`status-badge status-badge-lg ${getStatusClass(inv.status)}`} style={{ marginLeft: 'auto' }}>
            {inv.status || 'Unknown'}
          </span>
          <button className="btn-secondary" onClick={handlePrint} style={{ marginLeft: 8 }}>
            🖨 Print
          </button>
        </div>

        {/* Status update bar */}
        <div className="status-update-bar">
          <span className="status-update-label">Update Status:</span>
          <select
            className="status-update-select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button
            className="btn-primary"
            onClick={handleStatusUpdate}
            disabled={updating || newStatus === inv.status}
            style={{ padding: '7px 16px', fontSize: 13 }}
          >
            {updating ? 'Updating…' : 'Apply'}
          </button>
          {updateMsg && <span className="update-msg">✓ {updateMsg}</span>}
          {updateErr && <span className="update-msg-error">⚠️ {updateErr}</span>}
        </div>

        {/* Total bar */}
        <div className="invoice-total-bar">
          <div>
            <div className="invoice-total-label">Invoice Total</div>
            <div style={{ fontSize: 13, opacity: 0.65, marginTop: 2 }}>
              Period: {fmtDate(inv.periodStart)} – {fmtDate(inv.periodEnd)}
            </div>
          </div>
          <div className="invoice-total-amount">{fmtCurrency(inv.totalAmount)}</div>
        </div>

        {/* Detail cards grid */}
        <div className="detail-grid">

          {/* Shipper info */}
          <div className="detail-card">
            <div className="detail-card-title">🏢 Shipper Details</div>
            <div className="detail-rows">
              <div className="detail-row-item">
                <span className="detail-row-label">Shipper ID</span>
                <span className="detail-row-value" style={{ fontFamily: 'monospace' }}>
                  #{inv.shipperID}
                </span>
              </div>
              <div className="detail-row-item">
                <span className="detail-row-label">Name</span>
                <span className="detail-row-value">{shipper.name || '—'}</span>
              </div>
              <div className="detail-row-item">
                <span className="detail-row-label">Contact</span>
                <span className="detail-row-value">{shipper.contactInfo || '—'}</span>
              </div>
              <div className="detail-row-item">
                <span className="detail-row-label">Account Terms</span>
                <span className="detail-row-value">{shipper.accountTerms || '—'}</span>
              </div>
              <div className="detail-row-item">
                <span className="detail-row-label">Shipper Status</span>
                <span className="detail-row-value">
                  <span className={`status-badge ${getStatusClass(shipper.status)}`}>
                    {shipper.status || '—'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Invoice metadata */}
          <div className="detail-card">
            <div className="detail-card-title">📋 Invoice Details</div>
            <div className="detail-rows">
              <div className="detail-row-item">
                <span className="detail-row-label">Invoice ID</span>
                <span className="detail-row-value" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {fmtInvId(inv.invoiceID)}
                </span>
              </div>
              <div className="detail-row-item">
                <span className="detail-row-label">Period Start</span>
                <span className="detail-row-value">{fmtDate(inv.periodStart)}</span>
              </div>
              <div className="detail-row-item">
                <span className="detail-row-label">Period End</span>
                <span className="detail-row-value">{fmtDate(inv.periodEnd)}</span>
              </div>
              <div className="detail-row-item">
                <span className="detail-row-label">Issued At</span>
                <span className="detail-row-value">{fmtDateTime(inv.issuedAt)}</span>
              </div>
              <div className="detail-row-item">
                <span className="detail-row-label">Total Amount</span>
                <span className="detail-row-value" style={{ fontWeight: 700, fontSize: 16 }}>
                  {fmtCurrency(inv.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>



        {/* Footer actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {/* Delete button removed */}
        </div>

      </div>
    </Layout>
  );
}
