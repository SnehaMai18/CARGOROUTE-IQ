import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  getManifestById,
  updateManifest,
} from '../../api/manifestApi';
import { SITES } from '../../utils/constants';
import '../../styles/Bookings.css';
import '../../styles/DispatchManifests.css';

const MANIFEST_SERVICE_BASE = 'http://localhost:8001';

/** Build a browser-openable URL from the stored manifestURI */
function buildDocUrl(uri) {
  if (!uri) return null;
  // Already an absolute URL
  if (/^https?:\/\//i.test(uri)) return uri;
  // Relative path stored by backend (e.g. /manifests/xxx.pdf)
  return MANIFEST_SERVICE_BASE + (uri.startsWith('/') ? uri : '/' + uri);// If the stored URI is just a filename, we assume it's in the /manifests/ path
}

// ── Formatters ────────────────────────────────────────────────────────────────
function formatManifestId(id) { return `MF${String(id).padStart(4, '0')}`; }
function formatLoadId(id)     { return id ? `LD${String(id).padStart(4, '0')}` : '–'; }
function formatDateTime(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
function siteLabel(id) {
  const s = SITES.find((x) => x.id === Number(id));
  return s ? `${s.name} (${id})` : id ? String(id) : '–';
}

/**
 * Parse itemsJSON into a normalised array:
 *   [{bookingId, pieces, weightKg, volumeM3}]
 * Handles:
 *  1. Array of objects  – {bookingId/bookingID, pieces, weightKg/weight_kg, volumeM3/volume_m3}
 *  2. Array of strings  – each string becomes the bookingId entry
 *  3. Single object     – wrapped in array
 *  4. Plain string / unparseable – treat whole string as one bookingId entry
 */
function parseItems(raw) {
  if (!raw) return [];
  let parsed;
  try { parsed = JSON.parse(raw); } catch { parsed = raw; }

  const normalise = (item) => {
    if (typeof item === 'string') {
      return { bookingId: item, pieces: '–', weightKg: '–', volumeM3: '–' };
    }
    if (typeof item === 'object' && item !== null) {
      const bookingId = item.bookingId ?? item.bookingID ?? item.booking_id ?? item.bookingId ?? '–';
      const pieces    = item.pieces ?? item.qty ?? item.quantity ?? '–';
      const weightKg  = item.weightKg ?? item.weight_kg ?? item.weight ?? item.totalWeight ?? '–';
      const volumeM3  = item.volumeM3 ?? item.volume_m3 ?? item.volume ?? item.totalVolume ?? '–';
      return {
        bookingId: bookingId !== null && bookingId !== undefined ? bookingId : '–',
        pieces:    pieces    !== null && pieces    !== undefined ? pieces    : '–',
        weightKg:  weightKg  !== null && weightKg  !== undefined ? weightKg  : '–',
        volumeM3:  volumeM3  !== null && volumeM3  !== undefined ? volumeM3  : '–',
      };
    }
    return { bookingId: String(item), pieces: '–', weightKg: '–', volumeM3: '–' };
  };

  if (Array.isArray(parsed)) return parsed.map(normalise);
  if (typeof parsed === 'object' && parsed !== null) return [normalise(parsed)];
  return [{ bookingId: String(parsed), pieces: '–', weightKg: '–', volumeM3: '–' }];
}

export default function ManifestDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [isEditing, setIsEditing]   = useState(false);

  // Edit state — only warehouseID and itemsJSON are persisted by the backend
  const [editWarehouseID, setEditWarehouseID] = useState('');
  const [editItems,       setEditItems]       = useState([]);
  const [updateMsg, setUpdateMsg]             = useState('');
  const [updateErr, setUpdateErr]             = useState('');
  const [updating,  setUpdating]              = useState(false);

  const EMPTY_ITEM = { bookingId: '', pieces: '', weightKg: '', volumeM3: '' };

  const loadManifest = useCallback(() => {
    setLoading(true);
    setError('');
    getManifestById(id)
      .then((data) => {
        setItem(data);
        const mf = data.manifest || {};
        setEditWarehouseID(mf.warehouseID ? String(mf.warehouseID) : '');
        // Initialise structured rows from stored itemsJSON
        const rows = parseItems(mf.itemsJSON);
        setEditItems(
          rows.length > 0
            ? rows.map((r) => ({
                bookingId: r.bookingId === '–' ? '' : String(r.bookingId),
                pieces:    r.pieces    === '–' ? '' : String(r.pieces),
                weightKg:  r.weightKg  === '–' ? '' : String(r.weightKg),
                volumeM3:  r.volumeM3  === '–' ? '' : String(r.volumeM3),
              }))
            : [{ ...EMPTY_ITEM }]
        );
        if (location.state?.edit) setIsEditing(true);
      })
      .catch(() => setError('Manifest not found or ManifestService unavailable.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { loadManifest(); }, [loadManifest]);



  // ── Item row helpers ─────────────────────────────────────────────────────

  const handleItemChange = (index, field, value) => {
    setEditItems((prev) => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
    setUpdateMsg(''); setUpdateErr('');
  };

  const addItemRow    = () => setEditItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItemRow = (index) => setEditItems((prev) => prev.filter((_, i) => i !== index));

  // ── Update ────────────────────────────────────────────────────────────────

  const handleUpdate = () => {
    const mf = item?.manifest || {};
    setUpdateMsg(''); setUpdateErr('');
    // Serialise structured rows back into itemsJSON
    const filledRows = editItems.filter((r) => r.bookingId.trim());
    const itemsJSON = filledRows.length > 0
      ? JSON.stringify(filledRows.map((r) => ({
          bookingId: Number(r.bookingId) || r.bookingId,
          pieces:    r.pieces    !== '' ? Number(r.pieces)   : null,
          weightKg:  r.weightKg  !== '' ? Number(r.weightKg) : null,
          volumeM3:  r.volumeM3  !== '' ? Number(r.volumeM3) : null,
        })))
      : null;
    setUpdating(true);
    updateManifest(id, {
      loadID:      mf.loadID,
      warehouseID: editWarehouseID ? Number(editWarehouseID) : mf.warehouseID,
      itemsJSON,
    })
      .then(() => { setUpdateMsg('Manifest updated successfully.'); loadManifest(); })
      .catch(() => setUpdateErr('Update failed. Please try again.'))
      .finally(() => setUpdating(false));
  };

  // ── Guard renders ─────────────────────────────────────────────────────────

  if (loading) return <Layout><div className="loading-spinner">Loading manifest…</div></Layout>;
  if (error || !item) {
    return (
      <Layout>
        <div className="auth-message auth-message-error">
          ⚠ {error || 'Manifest not found.'}
          <button className="btn-secondary" onClick={() => navigate('/manifests')} style={{ marginLeft: 12 }}>← Back</button>
        </div>
      </Layout>
    );
  }

  const mf = item.manifest || {};
  const ld = item.load     || {};
  const v  = item.vehicle  || {};

  return (
    <Layout>
      <div className="booking-detail-page manifests-page">

        {/* ── Header ── */}
        <div className="detail-header">
          <div className="detail-header-left">
            <button className="back-btn" onClick={() => { if (isEditing) { setIsEditing(false); setUpdateMsg(''); setUpdateErr(''); } else { navigate('/manifests'); } }}>←</button>
            <div>
              <div className="detail-booking-id">{formatManifestId(mf.manifestID)}</div>
              <div className="page-subtitle">Manifest — {isEditing ? 'Edit' : 'Detail View'}</div>
            </div>
          </div>
        </div>

        {/* ── Detail Grid (VIEW) ── */}
        {!isEditing && <div className="manifest-detail-grid">

          {/* Row 1 – two equal columns */}
          <div className="manifest-top-row">

            {/* Manifest Info */}
            <div className="detail-card">
              <p className="detail-card-title">📋 Manifest Details</p>
              <div className="detail-row-2">
                <div className="detail-field">
                  <span className="detail-label">Manifest ID</span>
                  <span className="detail-value">{formatManifestId(mf.manifestID)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Load ID</span>
                  <span className="detail-value">{formatLoadId(mf.loadID)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Warehouse</span>
                  <span className="detail-value">{siteLabel(mf.warehouseID)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Created By</span>
                  <span className="detail-value">{mf.createdBy || '–'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Created At</span>
                  <span className="detail-value">{formatDateTime(mf.createdAt)}</span>
                </div>
             
                <div className="detail-field">
                  <span className="detail-label">Manifest Document</span>
                  <span className="detail-value">
                    {buildDocUrl(mf.manifestURI)
                      ? <a href={buildDocUrl(mf.manifestURI)} target="_blank" rel="noreferrer">View</a>
                      : '–'}
                  </span>
                </div>
              </div>
            </div>

            {/* Load Info */}
            <div className="detail-card">
              <p className="detail-card-title">🚛 Load Information</p>
              {ld.loadID ? (
                <div className="detail-row-2">
                  <div className="detail-field">
                    <span className="detail-label">Load Code</span>
                    <span className="detail-value">{ld.loadCode || '–'}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">{ld.status || '–'}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Planned Start</span>
                    <span className="detail-value">{formatDateTime(ld.plannedStart)}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Planned End</span>
                    <span className="detail-value">{formatDateTime(ld.plannedEnd)}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Weight / Volume</span>
                    <span className="detail-value">
                      {ld.totalWeightKg != null ? `${ld.totalWeightKg} kg` : '–'}
                      {ld.totalVolumeM3 != null ? ` · ${ld.totalVolumeM3} m³` : ''}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No load data available.</p>
              )}
            </div>
          </div>{/* end manifest-top-row */}

          {/* Items — full width */}
          {mf.itemsJSON && (() => {
            const rows = parseItems(mf.itemsJSON);
            return (
              <div className="detail-card">
                <p className="detail-card-title">📦 Items</p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#370a6e' }}>
                        <th style={{ padding: '8px 12px', color: '#fff', fontWeight: 600, textAlign: 'left',   fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Booking ID</th>
                        <th style={{ padding: '8px 12px', color: '#fff', fontWeight: 600, textAlign: 'center', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Pieces</th>
                        <th style={{ padding: '8px 12px', color: '#fff', fontWeight: 600, textAlign: 'center', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Weight (kg)</th>
                        <th style={{ padding: '8px 12px', color: '#fff', fontWeight: 600, textAlign: 'center', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Volume (m³)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                          <td style={{ padding: '9px 12px', color: '#1f3a5f', fontFamily: 'monospace', fontSize: 12, textAlign: 'left'   }}>{row.bookingId}</td>
                          <td style={{ padding: '9px 12px', color: '#1a2b45', textAlign: 'center' }}>{row.pieces}</td>
                          <td style={{ padding: '9px 12px', color: '#334155', textAlign: 'center' }}>{row.weightKg}</td>
                          <td style={{ padding: '9px 12px', color: '#334155', textAlign: 'center' }}>{row.volumeM3}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Vehicle — full width */}
          <div className="detail-card">
            <p className="detail-card-title">🚚 Vehicle</p>
            {v.vehicleID ? (
              <div className="detail-row-2">
                <div className="detail-field">
                  <span className="detail-label">Reg Number</span>
                  <span className="detail-value">{v.regNumber || '–'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Type</span>
                  <span className="detail-value">{v.type || '–'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Max Capacity</span>
                  <span className="detail-value">
                    {v.maxWeightKg != null ? `${v.maxWeightKg} kg` : '–'}
                    {v.maxVolumeM3 != null ? ` · ${v.maxVolumeM3} m³` : ''}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{v.status || '–'}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No vehicle data available.</p>
            )}
          </div>

        </div>}{/* end manifest-detail-grid (view) */}

        {/* ── EDIT MODE ── */}
        {isEditing && <div style={{ padding: '0 0 24px 0' }}><div className="detail-card" style={{ border: '2px solid #3b82f6', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            <p className="detail-card-title" style={{ color: '#1d4ed8', marginBottom: 16 }}>✏️ Update Manifest</p>

            {/* Warehouse — full width */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                Warehouse <span className="required">*</span>
              </label>
              <select
                style={{
                  width: '100%', padding: '9px 12px',
                  borderRadius: 6, border: '1px solid #d1d5db',
                  fontSize: 14, background: '#fff', color: '#1f2937',
                  boxSizing: 'border-box',
                }}
                value={editWarehouseID}
                onChange={(e) => { setEditWarehouseID(e.target.value); setUpdateMsg(''); setUpdateErr(''); }}
              >
                <option value="">— Select warehouse —</option>
                {SITES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>
                ))}
              </select>
            </div>

            {/* Items — structured row editor */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 10 }}>
                📦 Items
              </label>

              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
                gap: 8, marginBottom: 6,
              }}>
                {['Booking ID', 'Pieces', 'Weight (kg)', 'Volume (m³)', ''].map((h) => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</span>
                ))}
              </div>

              {/* Item rows */}
              {editItems.map((row, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
                  gap: 8, marginBottom: 8, alignItems: 'center',
                }}>
                  <input
                    type="number" min="1"
                    placeholder="Booking ID"
                    value={row.bookingId}
                    onChange={(e) => handleItemChange(i, 'bookingId', e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                  />
                  <input
                    type="number" min="0"
                    placeholder="0"
                    value={row.pieces}
                    onChange={(e) => handleItemChange(i, 'pieces', e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                  />
                  <input
                    type="number" min="0" step="0.01"
                    placeholder="0.0"
                    value={row.weightKg}
                    onChange={(e) => handleItemChange(i, 'weightKg', e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                  />
                  <input
                    type="number" min="0" step="0.01"
                    placeholder="0.0"
                    value={row.volumeM3}
                    onChange={(e) => handleItemChange(i, 'volumeM3', e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeItemRow(i)}
                    disabled={editItems.length === 1}
                    style={{
                      background: 'none', border: 'none', color: editItems.length === 1 ? '#d1d5db' : '#ef4444',
                      cursor: editItems.length === 1 ? 'not-allowed' : 'pointer',
                      fontSize: 18, fontWeight: 700, lineHeight: 1, padding: 0,
                    }}
                    title="Remove row"
                  >×</button>
                </div>
              ))}

              <button
                type="button"
                onClick={addItemRow}
                style={{
                  marginTop: 4, background: 'none', border: '1px dashed #3b82f6',
                  color: '#3b82f6', borderRadius: 6, padding: '6px 14px',
                  fontSize: 13, cursor: 'pointer', fontWeight: 500,
                }}
              >
                + Add Row
              </button>
            </div>

            {/* Action row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <button className="btn-secondary" onClick={() => { setIsEditing(false); setUpdateMsg(''); setUpdateErr(''); }} disabled={updating}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpdate} disabled={updating} style={{ minWidth: 130 }}>
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
              {updateMsg && (
                <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 500 }}>✔ {updateMsg}</span>
              )}
              {updateErr && (
                <span style={{ color: '#dc2626', fontSize: 13, fontWeight: 500 }}>⚠ {updateErr}</span>
              )}
            </div>
          </div></div>}
          {/* end edit mode */}

      </div>

    </Layout>
  );
}
