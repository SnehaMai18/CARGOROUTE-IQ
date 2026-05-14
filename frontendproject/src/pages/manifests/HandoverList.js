import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination1 from '../../components/Pagination1';
import ActionMenuPortal from '../../components/ActionMenuPortal';
import {
  getAllHandovers,
  createHandover,
  updateHandover,
  deleteHandover,
  getAllManifests,
} from '../../api/manifestApi';
import { exportCSV } from '../../utils/csvExport';
import '../../styles/Bookings.css';
import '../../styles/DispatchManifests.css';

// ── Formatters ────────────────────────────────────────────────────────────────

function formatManifestId(id) { return id ? `MF${String(id).padStart(4, '0')}` : '–'; }
function formatHandoverId(id)  { return id ? `HV${String(id).padStart(4, '0')}` : '–'; }
function formatDateTime(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function toDatetimeLocal(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function nowDatetimeLocal() {
  return toDatetimeLocal(new Date().toISOString());
}
function toLocalDateTime(val) {
  if (!val) return null;
  return val.length === 16 ? val + ':00' : val;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateForm(f) {
  const errors = {};
  if (!f.manifestID)         errors.manifestID  = 'Select a manifest.';
  if (!f.handedBy.trim())    errors.handedBy    = 'Handed By is required.';
  if (!f.handedAt)           errors.handedAt    = 'Handed At is required.';
  if (!f.receivedBy.trim())  errors.receivedBy  = 'Received By is required.';
  return errors;
}

const EMPTY_FORM = { manifestID: '', handedBy: '', handedAt: '', receivedBy: '', notes: '' };
const PAGE_SIZE  = 4;

// ── Component ─────────────────────────────────────────────────────────────────

export default function HandoverList() {
  const navigate = useNavigate();

  const [handovers, setHandovers]   = useState([]);
  const [manifests, setManifests]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // form
  const [showForm, setShowForm]         = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [formFields, setFormFields]     = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]     = useState({});
  const [saving, setSaving]             = useState(false);
  const [formApiError, setFormApiError] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [creationTimestamp, setCreationTimestamp] = useState(null);


  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');
    getAllHandovers()
      .then(setHandovers)
      .catch(() => setError('Could not load handovers. Is ManifestsService running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
    getAllManifests().then(setManifests).catch(() => {});
  }, [loadData]);

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filtered = handovers.filter((h) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const hv = h.handover || {};
    const mf = h.manifestDetails?.manifest || {};
    return (
      formatHandoverId(hv.handoverID).toLowerCase().includes(q) ||
      formatManifestId(mf.manifestID || hv.manifestID).toLowerCase().includes(q) ||
      (hv.handedBy   || '').toLowerCase().includes(q) ||
      (hv.receivedBy || '').toLowerCase().includes(q) ||
      (hv.notes      || '').toLowerCase().includes(q)
    );
  });

  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = {
    total: handovers.length,
    today: handovers.filter((h) => {
      const dt = h.handover?.handedAt;
      if (!dt) return false;
      return new Date(dt).toDateString() === new Date().toDateString();
    }).length,
    unique: new Set(
      handovers.map((h) => h.handover?.handedBy).filter(Boolean)
    ).size,
  };

  // ── Form handlers ─────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setFormFields({ ...EMPTY_FORM, handedAt: nowDatetimeLocal() });
    setFormErrors({});
    setFormApiError('');
    setShowForm(true);
  };

  const openEdit = (h) => {
    const hv = h.handover || {};
    const mf = h.manifestDetails?.manifest || {};
    setEditingId(hv.handoverID);
    setFormFields({
      manifestID: String(mf.manifestID || hv.manifestID || ''),
      handedBy:   hv.handedBy   || '',
      handedAt:   toDatetimeLocal(hv.handedAt) || '',
      receivedBy: hv.receivedBy || '',
      notes:      hv.notes      || '',
    });
    setCreationTimestamp(hv.creationTimestamp || null);
    setFormErrors({});
    setFormApiError('');
    setShowForm(true);
  };

  const NAME_FIELDS = ['handedBy', 'receivedBy'];
  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = NAME_FIELDS.includes(name) ? value.replace(/[^a-zA-Z0-9 ]/g, '') : value;
    setFormFields((prev) => ({ ...prev, [name]: sanitized }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormApiError('');
    setFormSuccessMessage('');
    const errs = validateForm(formFields);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    // When editing, backend does NOT update manifestID — omit it
    const payload = editingId ? {
      handedBy:   formFields.handedBy.trim(),
      handedAt:   toLocalDateTime(formFields.handedAt),
      receivedBy: formFields.receivedBy.trim(),
      notes:      formFields.notes.trim() || null,
    } : {
      manifestID: Number(formFields.manifestID),
      handedBy:   formFields.handedBy.trim(),
      handedAt:   toLocalDateTime(formFields.handedAt),
      receivedBy: formFields.receivedBy.trim(),
      notes:      formFields.notes.trim() || null,
    };

    setSaving(true);
    const call = editingId
      ? updateHandover(editingId, payload)
      : createHandover(payload);

    call
      .then(() => {
        const action = editingId ? 'updated' : 'added';
        setFormSuccessMessage(`Handover ${action} successfully!`);
        setTimeout(() => {
          setShowForm(false);
          setFormSuccessMessage('');
          loadData();
          setSaving(false);
        }, 1500);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.response?.data || 'Failed to save handover.';
        setFormApiError(String(msg));
        setSaving(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this handover? This cannot be undone.')) return;
    deleteHandover(id)
      .then(() => loadData())
      .catch((err) => console.error('Delete failed:', err));
  };

  const handleExport = () => {
    const headers = ['Handover ID', 'Manifest ID', 'Handed By', 'Handed At', 'Received By', 'Notes'];
    const rows = filtered.map((h) => {
      const hv = h.handover || {};
      const mf = h.manifestDetails?.manifest || {};
      const manifestId = mf.manifestID || hv.manifestID;
      return [
        formatHandoverId(hv.handoverID),
        formatManifestId(manifestId),
        hv.handedBy || '–',
        formatDateTime(hv.handedAt),
        hv.receivedBy || '–',
        hv.notes || '–',
      ];
    });
    exportCSV(`handovers-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="bookings-page dispatch-page">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Handovers</h1>
            <p className="page-subtitle">Track manifest handover records between warehouse and transport</p>
          </div>
          <button className="btn-primary expand-btn icon-btn" title="Record Handover" onClick={openAdd}>
            <span className="expand-btn-icon">+</span>
            <span className="expand-btn-label">Record Handover</span>
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Handovers</div>
            <div className="stat-value">{stats.total}</div>
            <span className="stat-icon" role="img" aria-label="handover"></span>
          </div>
          <div className="stat-card">
            <div className="stat-label">Recorded Today</div>
            <div className="stat-value stat-transit">{stats.today}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unique Handlers</div>
            <div className="stat-value stat-delivered">{stats.unique}</div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="auth-message auth-message-error" style={{ marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Table ── */}
        <div className="table-section">
          <h2 className="section-title">All Handovers</h2>

          <div className="table-toolbar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search by handover ID, manifest, handed by, received by…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="toolbar-right">
              <button className="btn-toolbar-action" onClick={handleExport} title="Export as CSV">↓ Export</button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading handovers…</div>
          ) : (
            <div className="table-wrapper">
              <table className="bookings-table handover-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Handover ID</th>
                    <th style={{ textAlign: 'left' }}>Manifest</th>
                    <th style={{ textAlign: 'left' }}>Handed By</th>
                    <th style={{ textAlign: 'left' }}>Handed At</th>
                    <th style={{ textAlign: 'left' }}>Received By</th>
                    <th style={{ textAlign: 'left' }}>Notes</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        {handovers.length === 0
                          ? 'No handovers recorded yet.'
                          : 'No results match your search.'}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((h) => {
                      const hv = h.handover || {};
                      const mf = h.manifestDetails?.manifest || {};
                      const manifestId = mf.manifestID || hv.manifestID;

                      return (
                        <tr
                          key={hv.handoverID}
                          className="table-row"
                          onClick={() => navigate(`/manifests/${manifestId}`)}
                        >
                          <td className="booking-id-cell" style={{ textAlign: 'left' }}>{formatHandoverId(hv.handoverID)}</td>
                          <td className="booking-id-cell" style={{ textAlign: 'left' }}>{formatManifestId(manifestId)}</td>
                          <td style={{ textAlign: 'left' }}>{hv.handedBy    || '–'}</td>
                          <td style={{ textAlign: 'left' }}>{formatDateTime(hv.handedAt)}</td>
                          <td style={{ textAlign: 'left' }}>{hv.receivedBy  || '–'}</td>
                          <td style={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                            {hv.notes || '–'}
                          </td>
                          <td className="actions-cell" style={{ textAlign: 'right' }}>
                            <ActionMenuPortal
                              id={hv.handoverID}
                              actions={[
                                { label: 'View', onClick: () => navigate(`/manifests/${manifestId}`) },
                                { label: 'Edit', onClick: () => openEdit(h) },
                                { label: 'Delete', onClick: () => handleDelete(hv.handoverID), danger: true }
                              ]}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <Pagination1
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              infoText={`Page ${currentPage} of ${totalPages}`}
            />
          )}
        </div>
      </div>

      {/* ── Add / Edit Handover Slide-in Panel ── */}
      {showForm && (
        <div
          className="claim-form-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="claim-form-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <button type="button" className="back-btn" onClick={() => setShowForm(false)} title="Back">
                ←
              </button>
              <h2 style={{ margin: 0 }}>{editingId ? 'Edit Handover' : 'Record Handover'}</h2>
            </div>

            <form onSubmit={handleSubmit} noValidate className="form-section">

              <div className="form-field">
                <label>Manifest <span className="required">*</span></label>
                <select
                  name="manifestID"
                  value={formFields.manifestID}
                  onChange={handleChange}
                  className={formErrors.manifestID ? 'input-error' : ''}
                  disabled={!!editingId}
                >
                  <option value="">— Select manifest —</option>
                  {manifests.map((m) => {
                    const mf = m.manifest || {};
                    return (
                      <option key={mf.manifestID} value={mf.manifestID}>
                        {formatManifestId(mf.manifestID)}
                        {mf.createdBy ? ` · ${mf.createdBy}` : ''}
                      </option>
                    );
                  })}
                </select>
                {formErrors.manifestID && <span className="error-msg">{formErrors.manifestID}</span>}
              </div>

              <div className="form-field">
                <label>Handed By <span className="required">*</span></label>
                <input
                  type="text"
                  name="handedBy"
                  placeholder="Name of person handing over"
                  value={formFields.handedBy}
                  onChange={handleChange}
                  className={formErrors.handedBy ? 'input-error' : ''}
                />
                {formErrors.handedBy && <span className="error-msg">{formErrors.handedBy}</span>}
              </div>

              <div className="form-field">
                <label>Handed At <span className="required">*</span></label>
                <input
                  type="datetime-local"
                  name="handedAt"
                  value={formFields.handedAt}
                  onChange={handleChange}
                  className={formErrors.handedAt ? 'input-error' : ''}
                />
                {formErrors.handedAt && <span className="error-msg">{formErrors.handedAt}</span>}
              </div>

              <div className="form-field">
                <label>Received By <span className="required">*</span></label>
                <input
                  type="text"
                  name="receivedBy"
                  placeholder="Name of person receiving"
                  value={formFields.receivedBy}
                  onChange={handleChange}
                  className={formErrors.receivedBy ? 'input-error' : ''}
                />
                {formErrors.receivedBy && <span className="error-msg">{formErrors.receivedBy}</span>}
              </div>

              <div className="form-field">
                <label>Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={300}
                  placeholder="Optional remarks about the handover…"
                  value={formFields.notes}
                  onChange={handleChange}
                />
                <span className="field-hint" style={{ color: formFields.notes.length >= 280 ? '#ef4444' : '#94a3b8' }}>
                  {formFields.notes.length}/300 characters
                </span>
              </div>

              {editingId && creationTimestamp && (
                <div className="form-field">
                  <label>Creation Time</label>
                  <div style={{ padding: '8px 12px', background: '#f3f4f6', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                    {formatDateTime(creationTimestamp)}
                  </div>
                </div>
              )}

              {formSuccessMessage && (
                <div className="auth-message auth-message-success">✔ {formSuccessMessage}</div>
              )}
              {formApiError && (
                <div className="auth-message auth-message-error">⚠ {formApiError}</div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
