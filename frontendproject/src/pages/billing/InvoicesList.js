import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination1 from '../../components/Pagination1';
import {
  getAllInvoices,
  createInvoice,
  deleteInvoice,
} from '../../api/billingApi';
import '../../styles/Billing.css';

const STATUS_OPTIONS = ['Pending', 'Paid', 'Overdue', 'Cancelled', 'Draft', 'Issued'];

const EMPTY_FORM = {
  shipperID:   '',
  periodStart: '',
  periodEnd:   '',
  linesJSON:   '[\n  {\n    "description": "",\n    "quantity": 1,\n    "unitPrice": 0.00,\n    "lineTotal": 0.00\n  }\n]',
  totalAmount: '',
  issuedAt:    '',
  status:      '',
};

// ── Helpers ──────────────────────────────────────────────────────
function parseYMD(str) {
  // accepts yyyy-mm-dd (native <input type="date"> format)
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function validate(form) {
  const errs = {};

  // 1. Shipper ID
  if (!form.shipperID) {
    errs.shipperID = 'Shipper ID is required.';
  } else if (isNaN(Number(form.shipperID)) || !Number.isInteger(Number(form.shipperID)) || Number(form.shipperID) <= 0) {
    errs.shipperID = 'Shipper ID must be a positive whole number (e.g. 501).';
  }

  // 2. Period Start
  if (!form.periodStart) {
    errs.periodStart = 'Period start is required. Please select a date.';
  }

  // 3. Period End
  if (!form.periodEnd) {
    errs.periodEnd = 'Period end is required. Please select a date.';
  } else if (form.periodStart && form.periodEnd && form.periodEnd < form.periodStart) {
    errs.periodEnd = 'Period end must be on or after Period start.';
  }

  // 5. Billing Lines JSON — validated first so we can cross-check total
  let linesTotal = null;
  if (!form.linesJSON.trim()) {
    errs.linesJSON = 'Billing lines JSON is required.';
  } else {
    let parsed;
    try { parsed = JSON.parse(form.linesJSON); } catch { errs.linesJSON = 'Invalid JSON format. Check your syntax.'; }
    if (parsed !== undefined) {
      if (!Array.isArray(parsed)) {
        errs.linesJSON = 'Billing lines must be a JSON array [ ... ].';
      } else if (parsed.length === 0) {
        errs.linesJSON = 'Billing lines cannot be empty. Add at least one line item.';
      } else {
        const lineErrs = [];
        let sum = 0;
        parsed.forEach((line, i) => {
          const n = i + 1;
          if (!line.description || String(line.description).trim() === '')
            lineErrs.push(`Line ${n}: description is required.`);
          if (line.quantity == null || isNaN(Number(line.quantity)) || Number(line.quantity) <= 0)
            lineErrs.push(`Line ${n}: quantity must be a number > 0.`);
          if (line.unitPrice == null || isNaN(Number(line.unitPrice)) || Number(line.unitPrice) <= 0)
            lineErrs.push(`Line ${n}: unitPrice must be a number > 0.`);
          if (line.quantity > 0 && line.unitPrice > 0) {
            const expected = Math.round(Number(line.quantity) * Number(line.unitPrice) * 100) / 100;
            if (line.lineTotal != null && Math.abs(Number(line.lineTotal) - expected) > 0.01)
              lineErrs.push(`Line ${n}: lineTotal (${line.lineTotal}) must equal quantity × unitPrice (${expected}).`);
            sum += expected;
          }
        });
        if (lineErrs.length) errs.linesJSON = lineErrs.join(' ');
        else linesTotal = Math.round(sum * 100) / 100;
      }
    }
  }

  // 4. Total Amount — must match computed lines total
  if (!form.totalAmount) {
    errs.totalAmount = 'Total amount is required.';
  } else if (isNaN(Number(form.totalAmount)) || Number(form.totalAmount) <= 0) {
    errs.totalAmount = 'Total amount must be a number greater than 0.';
  } else if (linesTotal !== null && Math.abs(Number(form.totalAmount) - linesTotal) > 0.01) {
    errs.totalAmount = `Total amount (${form.totalAmount}) does not match the sum of billing lines (${linesTotal}). Please correct it.`;
  }

  // 6. Issued At — optional but if provided must not be a future date
  if (form.issuedAt) {
    const d = parseYMD(form.issuedAt);
    if (!d) {
      errs.issuedAt = 'Please select a valid issued date.';
    } else {
      const today = new Date(); today.setHours(23, 59, 59, 999);
      if (d > today) errs.issuedAt = 'Issued date cannot be a future date.';
    }
  }

  // Status
  if (!form.status) errs.status = 'Please select a status.';

  return errs;
}

function fmtInvId(id) { return `INV${String(id).padStart(4, '0')}`; }

function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

export default function InvoicesList() {
  const navigate = useNavigate();
  const location = useLocation();

  const [invoices,     setInvoices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');

  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [formErrors,  setFormErrors]  = useState({});
  const [saving,      setSaving]      = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [openMenuId,   setOpenMenuId]   = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getAllInvoices()
      .then(setInvoices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Stats
  const total   = invoices.length;
  const pending = invoices.filter((r) => (r.invoice?.status || '').toLowerCase() === 'pending').length;
  const paid    = invoices.filter((r) => (r.invoice?.status || '').toLowerCase() === 'paid').length;
  const overdue = invoices.filter((r) => (r.invoice?.status || '').toLowerCase() === 'overdue').length;
  const totalRev = invoices
    .filter((r) => (r.invoice?.status || '').toLowerCase() === 'paid')
    .reduce((s, r) => s + (r.invoice?.totalAmount || 0), 0);

  const filtered = invoices.filter((r) => {
    const inv     = r.invoice || {};
    const shipper = r.shipper || {};
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      fmtInvId(inv.invoiceID).toLowerCase().includes(q) ||
      (shipper.name || '').toLowerCase().includes(q) ||
      String(inv.shipperID || '').includes(q);
    const matchS =
      statusFilter === 'ALL' ||
      (inv.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchQ && matchS;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const currentRows = filtered.slice(indexOfFirstRow, indexOfFirstRow + rowsPerPage);
  const handlePageChange = (page) => { if (page < 1 || page > totalPages) return; setCurrentPage(page); };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSaving(true);
    setError('');
    try {
      const payload = {
        shipperID:   parseInt(form.shipperID, 10),
        periodStart: `${form.periodStart}T00:00:00`,
        periodEnd:   `${form.periodEnd}T23:59:59`,
        linesJSON:   form.linesJSON.trim(),
        totalAmount: parseFloat(form.totalAmount),
        issuedAt:    form.issuedAt ? `${form.issuedAt}T00:00:00` : new Date().toISOString().substring(0, 19),
        status:      form.status,
      };
      await createInvoice(payload);
      setSuccess('Invoice generated successfully.');
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInvoice(deleteTarget);
      setDeleteTarget(null);
      setSuccess('Invoice deleted successfully.');
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleExport = () => {
    const headers = ['Invoice ID','Shipper','Shipper ID','Period Start','Period End','Issued At','Total Amount','Status'];
    const rows = filtered.map((r) => {
      const inv = r.invoice || {};
      const sh  = r.shipper || {};
      return [
        fmtInvId(inv.invoiceID),
        sh.name || '',
        inv.shipperID || '',
        fmtDate(inv.periodStart),
        fmtDate(inv.periodEnd),
        fmtDate(inv.issuedAt),
        inv.totalAmount || 0,
        inv.status || '',
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'invoices.csv';
    a.click();
  };

  return (
    <Layout>
      <div className="billing-page" onClick={() => setOpenMenuId(null)}>

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">🧾 Invoices</h1>
            <p className="page-subtitle">Generate and manage shipper invoices with billing reconciliation</p>
          </div>
          <button className="btn-add-new" onClick={() => navigate('/billing/invoices/create')} title="Generate Invoice">+</button>
        </div>

        {error   && <div className="error-banner">⚠️ {error}</div>}
        {success && <div className="success-banner">✅ {success}</div>}

        <div className="billing-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Invoices</div>
            <div className="stat-value">{loading ? '\u2014' : total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value stat-pending">{loading ? '\u2014' : pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Paid</div>
            <div className="stat-value stat-paid">{loading ? '\u2014' : paid}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Overdue</div>
            <div className="stat-value stat-overdue">{loading ? '\u2014' : overdue}</div>
          </div>
        </div>

        {/* Revenue bar */}
        <div className="invoice-total-bar" style={{ marginBottom: 24 }}>
          <div className="invoice-total-label">Total Revenue Collected (Paid Invoices)</div>
          <div className="invoice-total-amount">{loading ? '…' : fmtCurrency(totalRev)}</div>
        </div>

        {/* Table */}
        <div className="table-section">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2b45', margin: '0 0 14px' }}>All Invoices</h2>
          <div className="table-toolbar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search by invoice ID or shipper name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="toolbar-right">
              <div className="filter-wrapper">
                <span style={{ fontSize: 13, color: '#64748b' }}>Status:</span>
                <select
                  className="status-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All</option>
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button className="btn-export" onClick={handleExport}>⬇ Export</button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading invoices…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {search || statusFilter !== 'ALL'
                ? 'No invoices match your filters.'
                : 'No invoices yet. Click "+ Generate Invoice" to create one.'}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="billing-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '220px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '90px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Invoice id</th>
                    <th>Shipper</th>
                    <th>Issued at</th>
                    <th>Total amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((r) => {
                    const inv     = r.invoice || {};
                    const shipper = r.shipper || {};
                    return (
                      <tr key={inv.invoiceID}>
                        <td className="billing-id-cell">{fmtInvId(inv.invoiceID)}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {shipper.name || `Shipper #${inv.shipperID}`}
                          </div>
                          {shipper.contactInfo && (
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>{shipper.contactInfo}</div>
                          )}
                        </td>
                        <td style={{ fontSize: 13 }}>{fmtDate(inv.issuedAt)}</td>
                        <td className="amount-cell">{fmtCurrency(inv.totalAmount)}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(inv.status)}`}>
                            {inv.status || 'Unknown'}
                          </span>
                        </td>
                        <td style={{ position: 'relative' }}>
                          <button
                            className="btn-dots-menu"
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === inv.invoiceID ? null : inv.invoiceID); }}
                            title="Actions"
                          >⋯</button>
                          {openMenuId === inv.invoiceID && (
                            <div className="dots-dropdown" onClick={(e) => e.stopPropagation()}>
                              <button className="dots-item" onClick={() => { setOpenMenuId(null); navigate(`/billing/invoices/${inv.invoiceID}`); }}>👁 View</button>
                              <button className="dots-item dots-item-danger" onClick={() => { setOpenMenuId(null); setDeleteTarget(inv.invoiceID); }}>🗑 Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Pagination1
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                infoText={`Page ${currentPage} of ${totalPages}`}
              />
            </div>
          )}
        </div>

        {/* ── Generate Invoice Modal ── */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <div className="modal-body">
                {Object.keys(formErrors).length > 0 && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 14,
                    fontSize: 13,
                    color: '#dc2626',
                  }}>
                    ⚠️ Please fix the following errors before submitting:
                    <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                      {Object.values(formErrors).map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                  </div>
                )}
                <div className="form-field">
                  <label>Shipper ID <span className="required">*</span></label>
                  <input
                    type="number"
                    name="shipperID"
                    value={form.shipperID}
                    onChange={handleField}
                    placeholder="e.g. 501"
                    min="1"
                    className={formErrors.shipperID ? 'input-error' : ''}
                  />
                  {formErrors.shipperID && <span className="field-error">{formErrors.shipperID}</span>}
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label>Period Start <span className="required">*</span></label>
                    <input
                      type="date"
                      name="periodStart"
                      value={form.periodStart}
                      onChange={handleField}
                      className={formErrors.periodStart ? 'input-error' : ''}
                    />
                    {formErrors.periodStart && <span className="field-error">{formErrors.periodStart}</span>}
                  </div>
                  <div className="form-field">
                    <label>Period End <span className="required">*</span></label>
                    <input
                      type="date"
                      name="periodEnd"
                      value={form.periodEnd}
                      onChange={handleField}
                      min={form.periodStart || undefined}
                      className={formErrors.periodEnd ? 'input-error' : ''}
                    />
                    {formErrors.periodEnd && <span className="field-error">{formErrors.periodEnd}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label>Total Amount (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={form.totalAmount}
                    onChange={handleField}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className={formErrors.totalAmount ? 'input-error' : ''}
                  />
                  {formErrors.totalAmount && <span className="field-error">{formErrors.totalAmount}</span>}
                </div>

                <div className="form-field">
                  <label>Billing Lines JSON <span className="required">*</span></label>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                    Each line must have: <code>description</code>, <code>quantity</code> (&gt;0), <code>unitPrice</code> (&gt;0), <code>lineTotal</code> (= qty × unitPrice)
                  </div>
                  <textarea
                    name="linesJSON"
                    value={form.linesJSON}
                    onChange={handleField}
                    rows={5}
                    placeholder={'[\n  {\n    "description": "Freight Charge",\n    "quantity": 2,\n    "unitPrice": 500.00,\n    "lineTotal": 1000.00\n  }\n]'}
                    className={formErrors.linesJSON ? 'input-error' : ''}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                  {formErrors.linesJSON && <span className="field-error">{formErrors.linesJSON}</span>}
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label>Issued At <span style={{ fontSize: 11, color: '#94a3b8' }}>(optional)</span></label>
                    <input
                      type="date"
                      name="issuedAt"
                      value={form.issuedAt}
                      onChange={handleField}
                      max={new Date().toISOString().split('T')[0]}
                      className={formErrors.issuedAt ? 'input-error' : ''}
                    />
                    {formErrors.issuedAt && <span className="field-error">{formErrors.issuedAt}</span>}
                    {!form.issuedAt && !formErrors.issuedAt && (
                      <span style={{ fontSize: 11, color: '#f59e0b' }}>⚠ If not set, today’s date will be used.</span>
                    )}
                  </div>
                  <div className="form-field">
                    <label>Status <span className="required">*</span></label>
                    <select name="status" value={form.status} onChange={handleField}
                      className={formErrors.status ? 'input-error' : ''}>
                      <option value="">-- Select Status --</option>
                      {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    {formErrors.status && <span className="field-error">{formErrors.status}</span>}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setForm({ shipperID: '', periodStart: '', periodEnd: '', linesJSON: '', totalAmount: '', issuedAt: '', status: '' })}>Reset</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirm ── */}
        {deleteTarget && (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="delete-confirm-icon">🗑️</div>
              <p className="delete-confirm-text">
                Delete invoice <strong>{fmtInvId(deleteTarget)}</strong>?
                <br />This action cannot be undone.
              </p>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Reset</button>
                <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </Layout>
  );
}
