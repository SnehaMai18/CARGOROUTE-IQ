import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getBillingLineById, updateBillingLine } from '../../api/billingApi';
import '../../styles/Billing.css';

const EMPTY_FORM = { bookingID: '', loadID: '', amount: '', tariffApplied: '', notes: '' };

function validate(form) {
  const errs = {};
  if (!form.bookingID) {
    errs.bookingID = 'Booking ID is required.';
  } else if (isNaN(Number(form.bookingID)) || Number(form.bookingID) <= 0) {
    errs.bookingID = 'Booking ID must be a positive number.';
  }
  if (!form.amount) {
    errs.amount = 'Amount is required.';
  } else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
    errs.amount = 'Amount must be greater than 0.';
  }
  if (!form.tariffApplied.trim()) errs.tariffApplied = 'Tariff applied is required.';
  return errs;
}

export default function BillingLineEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getBillingLineById(id)
      .then((data) => {
        const bl = data.billing || data;
        setForm({
          bookingID:    bl.bookingID != null ? String(bl.bookingID) : '',
          loadID:       bl.loadID != null ? String(bl.loadID) : '',
          amount:       bl.amount != null ? String(bl.amount) : '',
          tariffApplied: bl.tariffApplied || '',
          notes:        bl.notes || '',
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    setError('');
    try {
      await updateBillingLine(id, {
        bookingID:    parseInt(form.bookingID, 10),
        loadID:       form.loadID ? parseInt(form.loadID, 10) : null,
        amount:       parseFloat(form.amount),
        tariffApplied: form.tariffApplied.trim(),
        notes:        form.notes.trim() || null,
      });
      setSuccess('Billing line updated successfully.');
      setTimeout(() => navigate('/billing/billing-lines'), 1200);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button className="btn-export" onClick={() => navigate('/billing/billing-lines')} style={{ flexShrink: 0, fontSize: 20, padding: '8px 12px' }}>←</button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2b45', margin: 0 }}>✏️ Edit Billing Line</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Update the billing line details below.</p>
          </div>
        </div>

        {loading && <div className="empty-state">Loading billing line...</div>}
        {error   && <div className="error-banner">⚠️ {error}</div>}
        {success && <div className="success-banner">✅ {success}</div>}

        {!loading && !error && (
          <>
            {Object.keys(formErrors).length > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
                ⚠️ Please fix the following errors before submitting:
                <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                  {Object.values(formErrors).filter(Boolean).map((msg, i) => <li key={i}>{msg}</li>)}
                </ul>
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Booking ID <span className="required">*</span></label>
                  <input type="number" name="bookingID" value={form.bookingID} onChange={handleField}
                    placeholder="e.g. 1" min="1" className={formErrors.bookingID ? 'input-error' : ''} />
                  {formErrors.bookingID && <span className="field-error">{formErrors.bookingID}</span>}
                </div>
                <div className="form-field">
                  <label>Load ID <span style={{ fontSize: 12, color: '#94a3b8' }}>(optional)</span></label>
                  <input type="number" name="loadID" value={form.loadID} onChange={handleField}
                    placeholder="e.g. 5" min="1" />
                </div>
              </div>

              <div className="form-field">
                <label>Amount (₹) <span className="required">*</span></label>
                <input type="number" name="amount" value={form.amount} onChange={handleField}
                  min="0.01" step="0.01" placeholder="0.00" className={formErrors.amount ? 'input-error' : ''} />
                {formErrors.amount && <span className="field-error">{formErrors.amount}</span>}
              </div>

              <div className="form-field">
                <label>Tariff Applied <span className="required">*</span></label>
                <input name="tariffApplied" value={form.tariffApplied} onChange={handleField}
                  placeholder="e.g. Standard Freight @ 2.5/kg" className={formErrors.tariffApplied ? 'input-error' : ''} />
                {formErrors.tariffApplied && <span className="field-error">{formErrors.tariffApplied}</span>}
              </div>

              <div className="form-field">
                <label>Notes <span style={{ fontSize: 12, color: '#94a3b8' }}>(optional)</span></label>
                <textarea name="notes" value={form.notes} onChange={handleField} rows={3} placeholder="Any remarks..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid #e4e7ed', marginTop: 4 }}>
                <button className="btn-secondary" onClick={() => setForm({ bookingID: '', loadID: '', amount: '', tariffApplied: '', notes: '' })}>Reset</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Saving…' : 'Update'}
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
