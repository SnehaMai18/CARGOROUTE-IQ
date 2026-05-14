import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createBooking, getAllShippers } from '../../api/bookingsApi';
import { SITES, HANDLING_FLAGS } from '../../utils/constants';
import '../../styles/Bookings.css';

const MAX_COMMODITY_LENGTH = 50;

const EMPTY_FORM = {
  shipperID: '',
  originSiteID: '',
  destinationSiteID: '',
  pickupWindowStart: '',
  pickupWindowEnd: '',
  deliveryWindowStart: '',
  deliveryWindowEnd: '',
  weightKg: '',
  volumeM3: '',
  pieces: '',
  commodity: '',
  specialHandlingFlags: [],
  status: 'SUBMITTED',
};

function validate(form) {
  const err = {};
  if (!form.shipperID)          err.shipperID         = 'Shipper is required';
  if (!form.originSiteID)       err.originSiteID      = 'Origin site is required';
  if (!form.destinationSiteID)  err.destinationSiteID = 'Destination site is required';
  if (form.originSiteID && form.originSiteID === form.destinationSiteID)
    err.destinationSiteID = 'Origin and destination must differ';
  if (!form.pickupWindowStart)     err.pickupWindowStart    = 'Required';
  if (!form.pickupWindowEnd)       err.pickupWindowEnd      = 'Required';
  if (!form.deliveryWindowStart)   err.deliveryWindowStart  = 'Required';
  if (!form.deliveryWindowEnd)     err.deliveryWindowEnd    = 'Required';
  if (!form.weightKg || Number(form.weightKg) <= 0) err.weightKg = 'Valid weight required';
  if (!form.volumeM3 || Number(form.volumeM3) <= 0) err.volumeM3 = 'Valid volume required';
  if (!form.pieces   || Number(form.pieces)   <  1)  err.pieces   = 'At least 1 unit required';
  
  if (!form.commodity.trim()) {
    err.commodity = 'Commodity is required';
  } else if (form.commodity.trim().length < 2) {
    err.commodity = 'Commodity must be at least 2 characters.';
  } else if (!/^[a-zA-Z0-9 ,]+$/.test(form.commodity.trim())) {
    err.commodity = 'Commodity must only contain letters, numbers, spaces, and commas.';
  } else if (form.commodity.trim().length > MAX_COMMODITY_LENGTH) {
    err.commodity = `Commodity must not exceed ${MAX_COMMODITY_LENGTH} characters.`;
  }
  return err;
}

export default function NewBooking() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [shippers, setShippers] = useState([]);

  useEffect(() => {
    getAllShippers()
      .then(setShippers)
      .catch((err) => {
        console.error('Failed to load shippers:', err?.response?.status, err?.response?.data || err.message);
        setMessage({ type: 'error', text: 'Could not load shippers. Please refresh the page.' });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleFlag = (key) => {
    setForm((prev) => ({
      ...prev,
      specialHandlingFlags: prev.specialHandlingFlags.includes(key)
        ? prev.specialHandlingFlags.filter((f) => f !== key)
        : [...prev.specialHandlingFlags, key],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const payload = {
      shipper:              { shipperID: Number(form.shipperID) },
      originSiteID:         Number(form.originSiteID),
      destinationSiteID:    Number(form.destinationSiteID),
      pickupWindowStart:    form.pickupWindowStart,
      pickupWindowEnd:      form.pickupWindowEnd,
      deliveryWindowStart:  form.deliveryWindowStart,
      deliveryWindowEnd:    form.deliveryWindowEnd,
      weightKg:             Number(form.weightKg),
      volumeM3:             Number(form.volumeM3),
      pieces:               Number(form.pieces),
      commodity:            form.commodity,
      specialHandlingFlags: form.specialHandlingFlags.join(','),
      status:               form.status,
    };

    try {
      await createBooking(payload);
      setMessage({ type: 'success', text: 'Booking created successfully! Redirecting…' });
      setTimeout(() => navigate('/bookings'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create booking.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  return (
    <Layout>
      <div className="booking-form-page">
        <div className="form-page-header">
          <button className="back-btn" onClick={() => navigate('/bookings')}>←</button>
          <div>
            <h1 className="page-title">New Booking</h1>
            <p className="page-subtitle">Create a new freight booking</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Shipper Information */}
          <div className="form-section">
            <h2 className="form-section-title">Shipper Information</h2>
            <div className="form-field" style={{ maxWidth: 480 }}>
              <label>Shipper <span className="required">*</span></label>
              <select name="shipperID" value={form.shipperID} onChange={handleChange}
                className={errors.shipperID ? 'input-error' : ''}>
                <option value="">Select shipper</option>
                {shippers.map((s) => (
                  <option key={s.shipperID} value={s.shipperID}>{s.name}</option>
                ))}
              </select>
              {shippers.length === 0 && <span className="field-hint">No shippers found.</span>}
              {errors.shipperID && <span className="error-msg">{errors.shipperID}</span>}
            </div>
          </div>

          {/* Locations */}
          <div className="form-section">
            <h2 className="form-section-title">Pickup &amp; Delivery Locations</h2>
            <div className="form-row form-row-2">
              <div className="form-field">
                <label>Origin Site <span className="required">*</span></label>
                <select name="originSiteID" value={form.originSiteID} onChange={handleChange}
                  className={errors.originSiteID ? 'input-error' : ''}>
                  <option value="">Select origin</option>
                  {SITES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.originSiteID && <span className="error-msg">{errors.originSiteID}</span>}
              </div>
              <div className="form-field">
                <label>Destination Site <span className="required">*</span></label>
                <select name="destinationSiteID" value={form.destinationSiteID} onChange={handleChange}
                  className={errors.destinationSiteID ? 'input-error' : ''}>
                  <option value="">Select destination</option>
                  {SITES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.destinationSiteID && <span className="error-msg">{errors.destinationSiteID}</span>}
              </div>
            </div>
          </div>

          {/* Windows */}
          <div className="form-section">
            <h2 className="form-section-title">Pickup &amp; Delivery Windows</h2>
            <div className="form-row form-row-2">
              {[
                ['pickupWindowStart','Pickup Window Start'],
                ['pickupWindowEnd','Pickup Window End'],
                ['deliveryWindowStart','Delivery Window Start'],
                ['deliveryWindowEnd','Delivery Window End']
              ].map(([name, label]) => (
                <div className="form-field" key={name}>
                  <label>{label} <span className="required">*</span></label>
                  <input type="datetime-local" name={name} value={form[name]} onChange={handleChange}
                    className={errors[name] ? 'input-error' : ''} />
                  {errors[name] && <span className="error-msg">{errors[name]}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Cargo Details */}
          <div className="form-section">
            <h2 className="form-section-title">Cargo Details</h2>
            <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
              <div className="form-field">
                <label>Weight (kg) <span className="required">*</span></label>
                <input type="number" name="weightKg" value={form.weightKg} onChange={handleChange}
                  placeholder="0" className={errors.weightKg ? 'input-error' : ''} />
                {errors.weightKg && <span className="error-msg">{errors.weightKg}</span>}
              </div>
              <div className="form-field">
                <label>Volume (m³) <span className="required">*</span></label>
                <input type="number" name="volumeM3" value={form.volumeM3} onChange={handleChange}
                  placeholder="0" step="0.1" className={errors.volumeM3 ? 'input-error' : ''} />
                {errors.volumeM3 && <span className="error-msg">{errors.volumeM3}</span>}
              </div>
              <div className="form-field">
                <label>Number of Units <span className="required">*</span></label>
                <input type="number" name="pieces" value={form.pieces} onChange={handleChange}
                  placeholder="0" className={errors.pieces ? 'input-error' : ''} />
                {errors.pieces && <span className="error-msg">{errors.pieces}</span>}
              </div>
            </div>
            <div className="form-field" style={{ marginBottom: 20 }}>
              <label>Commodity <span className="required">*</span></label>
              <input type="text" name="commodity" value={form.commodity} onChange={handleChange}
                placeholder="e.g., Electronics" maxLength={MAX_COMMODITY_LENGTH}
                className={errors.commodity ? 'input-error' : ''} />
              {errors.commodity && <span className="error-msg">{errors.commodity}</span>}
            </div>
            <div className="form-field">
              <label>Special Handling Requirements</label>
              <div className="checkbox-grid">
                {HANDLING_FLAGS.map((f) => (
                  <label key={f.key} className="checkbox-label">
                    <input type="checkbox" checked={form.specialHandlingFlags.includes(f.key)}
                      onChange={() => toggleFlag(f.key)} />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`auth-message auth-message-${message.type}`} style={{ marginBottom: 14 }}>
              <span>{message.type === 'success' ? '✔' : '⚠'}</span> {message.text}
            </div>
          )}

          <div className="form-footer">
            <div className="form-footer-spacer" />
            <div className="form-footer-actions">
              <button type="button" className="btn-secondary" onClick={handleReset}>Reset</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}