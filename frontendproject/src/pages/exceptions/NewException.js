import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createException } from '../../api/exceptionsApi';
import { EXCEPTION_TYPE_CONFIG } from '../../utils/constants';
import '../../styles/Bookings.css';
import '../../styles/Exceptions.css';
import { AuthContext } from '../../auth/AuthContext';

const MAX_DESCRIPTION_LENGTH = 500;

// ── Validation ───────────────────────────────────────────────────────────────

function validateExceptionForm(fields) {
  const errors = {};

  if (!fields.bookingId || isNaN(Number(fields.bookingId)) || Number(fields.bookingId) <= 0) {
    errors.bookingId = 'Enter a valid Booking ID (positive number).';
  }
  if (!fields.type) {
    errors.type = 'Select an exception type.';
  }
  // Description: required, not only special chars, max length enforced
  if (!fields.description.trim()) {
    errors.description = 'Description is required.';
  } else if (!/[a-zA-Z0-9]/.test(fields.description)) {
    errors.description = 'Description must include letters or numbers.';
  } else if (fields.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  return errors;
}

// ── Component ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  bookingId:   '',
  type:        '',
  description: '',
};

export default function NewException() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    // Only Shipper and Dispatcher may report exceptions
    const allowed = ['Shipper', 'Dispatcher'];
    if (!allowed.includes(user?.role)) {
      navigate('/unauthorized');
      return;
    }
  }, [user, navigate]);

  const [fields, setFields]   = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleReset = () => {
    setFields(EMPTY_FORM);
    setErrors({});
    setApiError('');
    setSaving(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError('');
    setMessage({ type: '', text: '' });

    const validationErrors = validateExceptionForm(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      bookingId:   Number(fields.bookingId),
      type:        fields.type,
      description: fields.description.trim(),
      // reportedBy is intentionally omitted — backend derives it from the JWT
    };

    setSaving(true);
    createException(payload)
      .then((created) => {
        const id = created?.exceptionID;
        // Show success message and delay navigation so user can read it
        setMessage({ type: 'success', text: 'Exception reported successfully.' });
        setSaving(false);
        setTimeout(() => {
          navigate(id ? `/exceptions/${id}` : '/exceptions');
        }, 1500);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to report exception. Please check the Booking ID and try again.';
        setApiError(String(msg));
        setSaving(false);
      });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="bookings-page exceptions-page">

        {/* Header */}
        <div className="form-page-header">
          <button className="back-btn" onClick={() => navigate('/exceptions')}>←</button>
          <div>
            <h1 className="page-title">Report Exception</h1>
            <p className="page-subtitle">Log a freight exception such as a delay, damage or missing shipment</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>

          {/* ── Booking Reference ── */}
          <div className="form-section">
            <div className="form-section-title">Booking Reference</div>

            <div className="form-row form-row-2">
              <div className="form-field">
                <label>
                  Booking ID <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="bookingId"
                  placeholder="e.g. 42"
                  value={fields.bookingId}
                  onChange={handleChange}
                  className={errors.bookingId ? 'input-error' : ''}
                  min="1"
                />
                {errors.bookingId && (
                  <span className="error-msg">{errors.bookingId}</span>
                )}
                <span className="field-hint">
                  The numeric booking ID this exception is linked to
                </span>
              </div>

              <div className="form-field">
                <label>
                  Exception Type <span className="required">*</span>
                </label>
                <select
                  name="type"
                  value={fields.type}
                  onChange={handleChange}
                  className={errors.type ? 'input-error' : ''}
                >
                  <option value="">— Select type —</option>
                  {Object.entries(EXCEPTION_TYPE_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.icon}  {cfg.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <span className="error-msg">{errors.type}</span>
                )}
              </div>
            </div>
          </div>



          {/* ── Incident Description ── */}
          <div className="form-section">
            <div className="form-section-title">Incident Description</div>

            <div className="form-field">
              <label>
                Description <span className="required">*</span>
              </label>
              <textarea
                name="description"
                rows={5}
                placeholder="Describe what happened — include relevant details such as location, time, items affected and immediate action taken…"
                value={fields.description}
                onChange={handleChange}
                maxLength={MAX_DESCRIPTION_LENGTH}
                className={errors.description ? 'input-error' : ''}
              />
              {errors.description && (
                <span className="error-msg">{errors.description}</span>
              )}
              <span className="field-hint">Maximum {MAX_DESCRIPTION_LENGTH} characters allowed</span>
            </div>
          </div>

          {/* ── API Error ── */}
          {message.text && (
            <div className={`auth-message auth-message-${message.type}`} style={{ marginBottom: 14 }}>
              <span>{message.type === 'success' ? '✔' : '⚠'}</span> {message.text}
            </div>
          )}
          {apiError && (
            <div className="error-banner">
              <span>⚠️ {apiError}</span>
            </div>
          )}

          {/* ── Submit ── */}
          <div className="form-actions-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              disabled={saving}
            >
              Reset
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Submitting…' : 'Report'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
