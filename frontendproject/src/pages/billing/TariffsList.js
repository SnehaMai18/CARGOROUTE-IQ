import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination1 from '../../components/Pagination1';
import {
  getAllTariffs,
  createTariff,
  updateTariff,
  deleteTariff,
} from '../../api/billingApi';
import '../../styles/Billing.css';

const EMPTY_FORM = {
  serviceType: '',
  ratePerKg: '',
  ratePerM3: '',
  minCharge: '',
  effectiveFrom: '',
  effectiveTo: '',
  status: 'Active',
};

const STATUS_OPTIONS = ['Active', 'Inactive'];

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

function validate(form) {
  const errs = {};
  if (!form.serviceType.trim()) errs.serviceType = 'Service type is required.';
  if (!form.ratePerKg || Number(form.ratePerKg) <= 0) errs.ratePerKg = 'Must be > 0.';
  if (!form.ratePerM3 || Number(form.ratePerM3) <= 0) errs.ratePerM3 = 'Must be > 0.';
  if (!form.minCharge || Number(form.minCharge) <= 0) errs.minCharge = 'Must be > 0.';
  if (!form.effectiveFrom) errs.effectiveFrom = 'Effective from is required.';
  if (!form.effectiveTo)   errs.effectiveTo   = 'Effective to is required.';
  if (form.effectiveFrom && form.effectiveTo && form.effectiveTo < form.effectiveFrom)
    errs.effectiveTo = 'Must be after Effective From.';
  return errs;
}

export default function TariffsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tariffs,    setTariffs]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null); // null = create, else tariffID
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [formErrors,  setFormErrors]  = useState({});
  const [saving,      setSaving]      = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [viewTarget,   setViewTarget]   = useState(null);
  const [openMenuId,   setOpenMenuId]   = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getAllTariffs()
      .then(setTariffs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tariffs.filter((t) => {
    const q = search.toLowerCase();
    const matchQ = !q || (t.serviceType || '').toLowerCase().includes(q);
    const matchS = statusFilter === 'ALL' || (t.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchQ && matchS;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const currentRows = filtered.slice(indexOfFirstRow, indexOfFirstRow + rowsPerPage);
  const handlePageChange = (page) => { if (page < 1 || page > totalPages) return; setCurrentPage(page); };

  /* ── Open create modal ── */
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  };

  /* ── Open edit modal ── */
  const openEdit = (t) => {
    setEditTarget(t.tariffID);
    setForm({
      serviceType:   t.serviceType   || '',
      ratePerKg:     t.ratePerKg     != null ? String(t.ratePerKg)  : '',
      ratePerM3:     t.ratePerM3     != null ? String(t.ratePerM3)  : '',
      minCharge:     t.minCharge     != null ? String(t.minCharge)  : '',
      effectiveFrom: t.effectiveFrom ? t.effectiveFrom.substring(0, 10) : '',
      effectiveTo:   t.effectiveTo   ? t.effectiveTo.substring(0, 10)   : '',
      status:        t.status        || 'Active',
    });
    setFormErrors({});
    setShowForm(true);
  };

  /* ── Save ── */
  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSaving(true);
    setError('');
    try {
      const payload = {
        serviceType:   form.serviceType.trim(),
        ratePerKg:     parseFloat(form.ratePerKg),
        ratePerM3:     parseFloat(form.ratePerM3),
        minCharge:     parseFloat(form.minCharge),
        effectiveFrom: form.effectiveFrom,
        effectiveTo:   form.effectiveTo,
        status:        form.status,
      };

      if (editTarget) {
        await updateTariff(editTarget, payload);
        setSuccess('Tariff updated successfully.');
      } else {
        await createTariff(payload);
        setSuccess('Tariff created successfully.');
      }
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTariff(deleteTarget);
      setDeleteTarget(null);
      setSuccess('Tariff deleted successfully.');
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

  return (
    <Layout>
      <div className="billing-page" onClick={() => setOpenMenuId(null)}>

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">💹 Tariffs</h1>
            <p className="page-subtitle">Rate cards for freight service types — applied during billing line generation</p>
          </div>
          <button className="btn-add-new" onClick={() => navigate('/billing/tariffs/create')} title="Create">+</button>
        </div>

        {error   && <div className="error-banner">⚠️ {error}</div>}
        {success && <div className="success-banner">✅ {success}</div>}

        {/* Stat cards */}
        <div className="billing-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total Tariffs</div>
            <div className="stat-value">{loading ? '—' : tariffs.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active</div>
            <div className="stat-value stat-active">{loading ? '—' : tariffs.filter(t => (t.status || '').toLowerCase() === 'active').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Inactive</div>
            <div className="stat-value stat-active">{loading ? '—' : tariffs.filter(t => (t.status || '').toLowerCase() === 'inactive').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Filtered</div>
            <div className="stat-value">{loading ? '—' : filtered.length}</div>
          </div>
        </div>

        {/* Tariff table */}
        <div className="table-section">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2b45', margin: '0 0 14px' }}>All Tariffs</h2>
          <div className="table-toolbar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search by service type…"
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
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading tariffs…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {search || statusFilter !== 'ALL'
                ? 'No tariffs match your filters.'
                : 'No tariffs yet. Click "+ New Tariff" to add one.'}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Service type</th>
                    <th>Min charge</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((t) => (
                    <tr key={t.tariffID}>
                      <td className="billing-id-cell">T{String(t.tariffID).padStart(3, '0')}</td>
                      <td style={{ fontWeight: 600 }}>{t.serviceType}</td>
                      <td className="amount-cell">₹{t.minCharge?.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(t.status)}`}>
                          {t.status || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions" style={{position:'relative'}}>
                          <button
                            className="btn-dots-menu"
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === t.tariffID ? null : t.tariffID); }}
                          >⋯</button>
                          {openMenuId === t.tariffID && (
                            <div className="dots-dropdown" onClick={(e) => e.stopPropagation()}>
                              <button className="dots-item" onClick={() => { setOpenMenuId(null); navigate(`/billing/tariffs/view/${t.tariffID}`); }}>👁 View</button>
                              <button className="dots-item" onClick={() => { setOpenMenuId(null); navigate(`/billing/tariffs/edit/${t.tariffID}`); }}>✏️ Edit</button>
                              <button className="dots-item dots-item-danger" onClick={() => { setOpenMenuId(null); setDeleteTarget(t.tariffID); }}>🗑 Delete</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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

        {/* ── Create / Edit Modal ── */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{editTarget ? 'Edit Tariff' : 'New Tariff'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="form-field">
                  <label>Service Type <span className="required">*</span></label>
                  <input
                    name="serviceType"
                    value={form.serviceType}
                    onChange={handleField}
                    placeholder="e.g. Standard Freight, Express, Refrigerated"
                    className={formErrors.serviceType ? 'input-error' : ''}
                  />
                  {formErrors.serviceType && <span className="field-error">{formErrors.serviceType}</span>}
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label>Rate per kg (₹) <span className="required">*</span></label>
                    <input
                      type="number"
                      name="ratePerKg"
                      value={form.ratePerKg}
                      onChange={handleField}
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className={formErrors.ratePerKg ? 'input-error' : ''}
                    />
                    {formErrors.ratePerKg && <span className="field-error">{formErrors.ratePerKg}</span>}
                  </div>
                  <div className="form-field">
                    <label>Rate per m³ (₹) <span className="required">*</span></label>
                    <input
                      type="number"
                      name="ratePerM3"
                      value={form.ratePerM3}
                      onChange={handleField}
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className={formErrors.ratePerM3 ? 'input-error' : ''}
                    />
                    {formErrors.ratePerM3 && <span className="field-error">{formErrors.ratePerM3}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label>Minimum Charge (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="minCharge"
                    value={form.minCharge}
                    onChange={handleField}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className={formErrors.minCharge ? 'input-error' : ''}
                  />
                  {formErrors.minCharge && <span className="field-error">{formErrors.minCharge}</span>}
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label>Effective From <span className="required">*</span></label>
                    <input
                      type="date"
                      name="effectiveFrom"
                      value={form.effectiveFrom}
                      onChange={handleField}
                      className={formErrors.effectiveFrom ? 'input-error' : ''}
                    />
                    {formErrors.effectiveFrom && <span className="field-error">{formErrors.effectiveFrom}</span>}
                  </div>
                  <div className="form-field">
                    <label>Effective To <span className="required">*</span></label>
                    <input
                      type="date"
                      name="effectiveTo"
                      value={form.effectiveTo}
                      onChange={handleField}
                      className={formErrors.effectiveTo ? 'input-error' : ''}
                    />
                    {formErrors.effectiveTo && <span className="field-error">{formErrors.effectiveTo}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleField}>
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setForm(EMPTY_FORM)}>Reset</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : editTarget ? 'Update Tariff' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── View Tariff Modal ── */}
        {viewTarget && (
          <div className="modal-overlay" onClick={() => setViewTarget(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Tariff — T{String(viewTarget.tariffID).padStart(3, '0')}</h2>
                <button className="modal-close" onClick={() => setViewTarget(null)}>✕</button>
              </div>
              <div className="view-detail-grid">
                <div className="view-detail-item">
                  <span className="view-detail-label">Tariff ID</span>
                  <span className="view-detail-value">T{String(viewTarget.tariffID).padStart(3, '0')}</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Service Type</span>
                  <span className="view-detail-value">{viewTarget.serviceType || '—'}</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Rate / kg</span>
                  <span className="view-detail-value">₹{viewTarget.ratePerKg}/kg</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Rate / m³</span>
                  <span className="view-detail-value">₹{viewTarget.ratePerM3}/m³</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Min Charge</span>
                  <span className="view-detail-value">₹{viewTarget.minCharge?.toLocaleString('en-IN')}</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Status</span>
                  <span className={`status-badge ${getStatusClass(viewTarget.status)}`}>{viewTarget.status || '—'}</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Effective From</span>
                  <span className="view-detail-value">{fmtDate(viewTarget.effectiveFrom)}</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Effective To</span>
                  <span className="view-detail-value">{fmtDate(viewTarget.effectiveTo)}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setViewTarget(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirm Modal ── */}
        {deleteTarget && (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="delete-confirm-icon">🗑️</div>
              <p className="delete-confirm-text">
                Are you sure you want to delete tariff{' '}
                <strong>T{String(deleteTarget).padStart(3, '0')}</strong>?
                <br />This action cannot be undone.
              </p>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
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
