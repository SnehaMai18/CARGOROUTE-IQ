import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createManifestWithFileApi } from '../../api/manifestApi';
import { SITES } from '../../utils/constants';
import '../../styles/Bookings.css';
import '../../styles/DispatchManifests.css';

const EMPTY_FORM = {
  loadID:      '',
  warehouseID: '',
  items:       [],
  itemInput:   { bookingId: '', pieces: '', weightKg: '', volumeM3: '' },
  createdBy:   '',
  manifestURI: '',
};

function validateManifestForm(form) {
  const err = {};
  if (!form.loadID || Number(form.loadID) <= 0) err.loadID    = 'Valid Load ID is required';
  if (!form.createdBy.trim())                    err.createdBy = 'Created By is required';
  if (!form.items || form.items.length === 0)   err.items     = 'Please add at least one item';
  return err;
}

/** Convert items array into a JSON string for the backend. */
function itemsToJSON(items) {
  if (!items || items.length === 0) return null;
  return JSON.stringify(items);
}

export default function NewManifest() {
  const navigate = useNavigate();
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState({ type: '', text: '' });
  const [uploadingPdf, setUploadingPdf]       = useState(false);
  const [selectedPdfName, setSelectedPdfName] = useState('');
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);

  const NAME_FIELDS = ['createdBy'];
  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = NAME_FIELDS.includes(name) ? value.replace(/[^a-zA-Z0-9 ]/g, '') : value;
    setForm((prev) => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const MAX_PDF_MB = 5;
  const MAX_PDF_SIZE = MAX_PDF_MB * 1024 * 1024;
  const ALLOWED_PDF_TYPES = ['application/pdf'];
  
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!ALLOWED_PDF_TYPES.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only PDF files are allowed. Please select a valid PDF file.' });
      e.target.value = '';
      return;
    }
    
    // Check file size
    if (file.size > MAX_PDF_SIZE) {
      setMessage({ type: 'error', text: `File too large. Maximum PDF size is ${MAX_PDF_MB} MB (your file: ${(file.size / (1024 * 1024)).toFixed(2)} MB). Please choose a smaller file.` });
      e.target.value = '';
      return;
    }
    
    setSelectedPdfName(file.name);
    setSelectedPdfFile(file);
    setMessage({ type: 'success', text: `PDF selected (${(file.size / (1024 * 1024)).toFixed(2)} MB) — will be uploaded on submit.` });
  };

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      itemInput: { ...prev.itemInput, [name]: value },
    }));
  };

  const addItem = (e) => {
    e.preventDefault();
    const { bookingId, pieces, weightKg, volumeM3 } = form.itemInput;
    if (!bookingId.trim()) {
      alert('Please enter a Booking ID');
      return;
    }

    const newItem = {
      bookingId:  bookingId.trim(),
      pieces:     pieces.trim() || '–',
      weightKg:   weightKg.trim() || '–',
      volumeM3:   volumeM3.trim() || '–',
    };

    setForm((prev) => ({
      ...prev,
      items:     [...prev.items, newItem],
      itemInput: { bookingId: '', pieces: '', weightKg: '', volumeM3: '' },
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateManifestForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (!selectedPdfFile) {
      setMessage({ type: 'error', text: 'Please select a PDF file before submitting.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const payload = {
      loadID:      Number(form.loadID),
      warehouseID: form.warehouseID ? Number(form.warehouseID) : null,
      itemsJSON:   itemsToJSON(form.items),
      createdBy:   form.createdBy.trim(),
    };

    try {
      await createManifestWithFileApi(payload, selectedPdfFile);
      setMessage({ type: 'success', text: 'Manifest created successfully! Redirecting…' });
      setTimeout(() => navigate('/manifests'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create manifest. Please try again.' });
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="booking-form-page manifests-page">

        {/* Page header */}
        <div className="form-page-header">
          <button className="back-btn" onClick={() => navigate('/manifests')}>←</button>
          <div>
            <h1 className="page-title">New Manifest</h1>
            <p className="page-subtitle">Create a shipment manifest for a load</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Load Information ──────────────────────────────────── */}
          <div className="form-section">
            <h2 className="form-section-title">Load Information</h2>
            <div className="form-row form-row-2">
              <div className="form-field">
                <label>Load ID <span className="required">*</span></label>
                <input
                  type="number"
                  name="loadID"
                  value={form.loadID}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  min="1"
                  className={errors.loadID ? 'input-error' : ''}
                />
                {errors.loadID && <span className="error-msg">{errors.loadID}</span>}
              </div>
              <div className="form-field">
                <label>Warehouse</label>
                <select name="warehouseID" value={form.warehouseID} onChange={handleChange}>
                  <option value="">— Select warehouse (optional) —</option>
                  {SITES.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Manifest Details ──────────────────────────────────── */}
          <div className="form-section">
            <h2 className="form-section-title">Manifest Details</h2>
            <div className="form-row form-row-2" style={{ marginBottom: 16 }}>
              <div className="form-field">
                <label>Created By <span className="required">*</span></label>
                <input
                  type="text"
                  name="createdBy"
                  value={form.createdBy}
                  onChange={handleChange}
                  placeholder="Your name or system identifier"
                  className={errors.createdBy ? 'input-error' : ''}
                />
                {errors.createdBy && <span className="error-msg">{errors.createdBy}</span>}
              </div>
              <div className="form-field">
                <label>Manifest PDF</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#370a6e    ', color: '#fff', padding: '7px 16px',
                    borderRadius: 6, cursor: uploadingPdf ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 500, opacity: uploadingPdf ? 0.7 : 1,
                    whiteSpace: 'nowrap',
                  }}>
                    {uploadingPdf ? 'Uploading…' : 'Choose PDF'}
                    <input
                      type="file"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      disabled={uploadingPdf || submitting}
                      onChange={handlePdfChange}
                    />
                  </label>
                  {selectedPdfName && (
                    <span style={{ fontSize: 12, color: '#64748b', maxWidth: 220,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedPdfName}
                    </span>
                  )}
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280' }}>
                  Note: Only PDF files are accepted. Maximum file size is <strong>5 MB</strong>.
                </p>
              </div>
            </div>
            <div className="form-field">
              <label>Items <span className="required">*</span></label>
              <div style={{ background: '#f9fafb', border: errors.items ? '1px solid #ef4444' : '1px solid #e5e7eb', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, marginBottom: 12 }}>
                  <input
                    type="text"
                    name="bookingId"
                    placeholder="Booking ID"
                    value={form.itemInput.bookingId}
                    onChange={handleItemInputChange}
                    style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
                  />
                  <input
                    type="text"
                    name="pieces"
                    placeholder="Pieces"
                    value={form.itemInput.pieces}
                    onChange={handleItemInputChange}
                    style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
                  />
                  <input
                    type="text"
                    name="weightKg"
                    placeholder="Weight (kg)"
                    value={form.itemInput.weightKg}
                    onChange={handleItemInputChange}
                    style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
                  />
                  <input
                    type="text"
                    name="volumeM3"
                    placeholder="Volume (m³)"
                    value={form.itemInput.volumeM3}
                    onChange={handleItemInputChange}
                    style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    style={{
                      background: '#370a6e    ',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 14px',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>
              {errors.items && <span className="error-msg">{errors.items}</span>}

              {form.items.length > 0 && (
                <div style={{ marginTop: 12, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #d1d5db' }}>Booking ID</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #d1d5db' }}>Pieces</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #d1d5db' }}>Weight (kg)</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #d1d5db' }}>Volume (m³)</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #d1d5db' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                          <td style={{ padding: '8px 10px', color: '#1f3a5f', fontFamily: 'monospace' }}>{item.bookingId}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', color: '#374151' }}>{item.pieces}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', color: '#374151' }}>{item.weightKg}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', color: '#374151' }}>{item.volumeM3}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: 4,
                                padding: '4px 8px',
                                fontWeight: 600,
                                fontSize: 11,
                                cursor: 'pointer',
                              }}
                            >
                              × Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <span className="field-hint">Add items with booking ID, pieces, weight, and volume (all optional except Booking ID).</span>
            </div>
          </div>

          {/* ── Message + Buttons ─────────────────────────────────── */}
          {message.text && (
            <div className={`auth-message auth-message-${message.type}`} style={{ marginBottom: 14 }}>
              <span>{message.type === 'success' ? '✔' : '⚠'}</span> {message.text}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'stretch', marginBottom: 24 }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ height: 38, padding: '0 24px' }}
              disabled={submitting}
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}
