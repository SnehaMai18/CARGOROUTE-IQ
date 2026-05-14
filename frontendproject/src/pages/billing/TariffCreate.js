import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createTariff } from '../../api/billingApi';
import '../../styles/Billing.css';

const STATUS_OPTIONS = ['Active', 'Inactive'];

const EMPTY_FORM = {
  serviceType: '',
  ratePerKg: '',
  ratePerM3: '',
  minCharge: '',
  effectiveFrom: '',
  effectiveTo: '',
  status: 'Active',
};

function validate(form) {
  const errs = {};
  if (!form.serviceType.trim()) errs.serviceType = 'Service type is required.';
  if (!form.ratePerKg || Number(form.ratePerKg) <= 0) errs.ratePerKg = 'Rate per kg must be greater than 0.';
  if (!form.ratePerM3 || Number(form.ratePerM3) <= 0) errs.ratePerM3 = 'Rate per m³ must be greater than 0.';
  if (!form.minCharge || Number(form.minCharge) <= 0) errs.minCharge = 'Minimum charge must be greater than 0.';
  if (!form.effectiveFrom) errs.effectiveFrom = 'Effective from date is required.';
  if (!form.effectiveTo)   errs.effectiveTo   = 'Effective to date is required.';
  if (form.effectiveFrom && form.effectiveTo && form.effectiveTo < form.effectiveFrom)
    errs.effectiveTo = 'Effective to must be after Effective from.';
  return errs;
}

export default function TariffCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      await createTariff({
        serviceType:   form.serviceType.trim(),
        ratePerKg:     parseFloat(form.ratePerKg),
        ratePerM3:     parseFloat(form.ratePerM3),
        minCharge:     parseFloat(form.minCharge),
        effectiveFrom: `${form.effectiveFrom}T00:00:00`,
        effectiveTo:   `${form.effectiveTo}T23:59:59`,
        status:        form.status,
      });
      navigate('/billing/tariffs', { state: { success: 'Tariff created successfully.' } });
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '16px', boxSizing: 'border-box' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button className="btn-export" onClick={() => navigate('/billing/tariffs')} style={{ flexShrink: 0 }}>
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2b45', margin: 0 }}>🏷️ New Tariff</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Fill in all required fields to create a tariff.</p>
          </div>
        </div>

        {/* Error banner */}
        {Object.keys(formErrors).length > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
            ⚠️ Please fix the following errors before submitting:
            <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
              {Object.values(formErrors).filter(Boolean).map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="form-field">
            <label>Service Type <span className="required">*</span></label>
            <input name="serviceType" value={form.serviceType} onChange={handleField}
              placeholder="e.g. Standard Freight, Express, Refrigerated"
              className={formErrors.serviceType ? 'input-error' : ''} />
            {formErrors.serviceType && <span className="field-error">{formErrors.serviceType}</span>}
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Rate per kg (₹) <span className="required">*</span></label>
              <input type="number" name="ratePerKg" value={form.ratePerKg} onChange={handleField}
                min="0.01" step="0.01" placeholder="0.00"
                className={formErrors.ratePerKg ? 'input-error' : ''} />
              {formErrors.ratePerKg && <span className="field-error">{formErrors.ratePerKg}</span>}
            </div>
            <div className="form-field">
              <label>Rate per m³ (₹) <span className="required">*</span></label>
              <input type="number" name="ratePerM3" value={form.ratePerM3} onChange={handleField}
                min="0.01" step="0.01" placeholder="0.00"
                className={formErrors.ratePerM3 ? 'input-error' : ''} />
              {formErrors.ratePerM3 && <span className="field-error">{formErrors.ratePerM3}</span>}
            </div>
          </div>

          <div className="form-field">
            <label>Minimum Charge (₹) <span className="required">*</span></label>
            <input type="number" name="minCharge" value={form.minCharge} onChange={handleField}
              min="0.01" step="0.01" placeholder="0.00"
              className={formErrors.minCharge ? 'input-error' : ''} />
            {formErrors.minCharge && <span className="field-error">{formErrors.minCharge}</span>}
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Effective From <span className="required">*</span></label>
              <input type="date" name="effectiveFrom" value={form.effectiveFrom} onChange={handleField}
                className={formErrors.effectiveFrom ? 'input-error' : ''} />
              {formErrors.effectiveFrom && <span className="field-error">{formErrors.effectiveFrom}</span>}
            </div>
            <div className="form-field">
              <label>Effective To <span className="required">*</span></label>
              <input type="date" name="effectiveTo" value={form.effectiveTo} onChange={handleField}
                min={form.effectiveFrom || undefined}
                className={formErrors.effectiveTo ? 'input-error' : ''} />
              {formErrors.effectiveTo && <span className="field-error">{formErrors.effectiveTo}</span>}
            </div>
          </div>

          <div className="form-field">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleField}>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid #e4e7ed', marginTop: 4 }}>
            <button className="btn-secondary" onClick={() => setForm(EMPTY_FORM)}>Reset</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '⏳ Saving…' : '🖊 Create'}
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}
