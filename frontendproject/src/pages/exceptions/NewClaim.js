import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createClaim, getClaimsByException } from '../../api/exceptionsApi';
import '../../styles/Bookings.css';
import '../../styles/Exceptions.css';
import { AuthContext } from '../../auth/AuthContext';

const MAX_RESOLUTION_NOTES = 500;

// ── Validation ───────────────────────────────────────────────────────────────

function validateClaimForm(fields) {
  const errors = {};
  if (!fields.exceptionId || isNaN(Number(fields.exceptionId)) || Number(fields.exceptionId) <= 0) {
    errors.exceptionId = 'Enter a valid Exception ID (positive number).';
  }
  if (!fields.amountClaimed || isNaN(Number(fields.amountClaimed)) || Number(fields.amountClaimed) <= 0) {
    errors.amountClaimed = 'Enter a valid amount (greater than 0).';
  }
  // Resolution notes: optional, but enforce maximum length
  if (fields.resolutionNotes && fields.resolutionNotes.trim().length > MAX_RESOLUTION_NOTES) {
    errors.resolutionNotes = `Resolution notes must not exceed ${MAX_RESOLUTION_NOTES} characters.`;
  }
  return errors;
}

// ── Component ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  exceptionId:     '',
  amountClaimed:   '',
  resolutionNotes: '',
};

export default function NewClaim() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Prevent Dispatchers from accessing this page even if route guard misses it
    if (user?.role === 'Dispatcher') {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  const [fields, setFields]     = useState(() => ({
    ...EMPTY_FORM,
    exceptionId: searchParams.get('exceptionId') || '',
  }));
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [apiError, setApiError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validateClaimForm(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      exceptionID:     Number(fields.exceptionId),
      amountClaimed:   Number(fields.amountClaimed),
      resolutionNotes: fields.resolutionNotes.trim() || null,
    };

    setSaving(true);
    createClaim(payload)
      .then(async () => {
        // Backend returns only a success message; fetch claims for the exception
        try {
          const list = await getClaimsByException(Number(fields.exceptionId));
          if (Array.isArray(list) && list.length > 0) {
            // Choose the claim with the highest claimID (most recently created)
            const newest = list.reduce((a, b) => (a.claimID > b.claimID ? a : b));
            // Show success message then redirect
            setMessage({ type: 'success', text: 'Claim filed successfully.' });
            setSaving(false);
            setTimeout(() => navigate(`/claims/${newest.claimID}`), 1500);
            return;
          }
        } catch (e) {
          // ignore and fall through to list view
        }
        setMessage({ type: 'success', text: 'Claim filed successfully.' });
        setSaving(false);
        setTimeout(() => navigate('/claims'), 1500);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to file claim. Check the Exception ID and try again.';
        setApiError(String(msg));
        setSaving(false);
      });
  };

  const handleReset = () => {
    setFields((prev) => ({ ...EMPTY_FORM, exceptionId: prev.exceptionId }));
    setErrors({});
    setApiError('');
    setSaving(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="booking-form-page">

        {/* ── Page Header ── */}
        <div className="form-page-header">
          <button className="back-btn" onClick={() => navigate('/claims')}>←</button>
          <div>
            <h1 className="page-title">File a Claim</h1>
            <p className="page-subtitle">
              Submit a compensation claim linked to a freight exception
            </p>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>

          <div className="form-section">
            <h2 className="form-section-title">Claim Details</h2>

            <div className="form-row form-row-2">
              <div className="form-field">
                <label>
                  Exception ID <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="exceptionId"
                  placeholder="e.g. 7"
                  value={fields.exceptionId}
                  onChange={handleChange}
                  className={errors.exceptionId ? 'input-error' : ''}
                  min="1"
                />
                {errors.exceptionId && (
                  <span className="error-msg">{errors.exceptionId}</span>
                )}
                <span className="field-hint">The numeric ID of the exception this claim is linked to</span>
              </div>
                <div className="form-field">
                  <label>
                    Amount Claimed (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="amountClaimed"
                    placeholder="e.g. 50000"
                    value={fields.amountClaimed}
                    onChange={handleChange}
                    className={errors.amountClaimed ? 'input-error' : ''}
                    min="0.01"
                    step="0.01"
                  />
                  {errors.amountClaimed && (
                    <span className="error-msg">{errors.amountClaimed}</span>
                  )}
                </div>
              </div>

          </div>

          <div className="form-section">
            <div className="form-section-title">Resolution Notes</div>
            <div className="form-field">
              <label>Resolution Notes</label>
              <textarea
                name="resolutionNotes"
                rows={4}
                placeholder="Optional — describe the basis for this claim or any supporting details…"
                value={fields.resolutionNotes}
                onChange={handleChange}
                maxLength={MAX_RESOLUTION_NOTES}
              />
              {errors.resolutionNotes && (
                <span className="error-msg">{errors.resolutionNotes}</span>
              )}
              <span className="field-hint">Maximum {MAX_RESOLUTION_NOTES} characters allowed</span>
            </div>
          </div>



          {/* ── API Error ── */}
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
              {saving ? 'Adding…' : 'Add'}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}
