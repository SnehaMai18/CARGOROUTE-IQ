import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getKpiById, updateKpi } from '../../api/kpiApi';
import '../../styles/Reports.css';

const KPI_NAMES = ['Utilization', 'OnTime', 'Revenue', 'Exceptions'];

const TARGET_OPTIONS = [90, 95];

const PERIOD_OPTIONS = [
  { value: 'Monthly',   label: 'Monthly (last 1 month)' },
  { value: 'Quarterly', label: 'Quarterly (last 3 months)' },
  { value: 'Yearly',    label: 'Yearly (last 12 months)' },
];

const EMPTY_FORM = { 
  name: 'Utilization', 
  target: 90, 
  reportingPeriod: 'Monthly',
  currentValue: '',
  notes: ''
};

function validate(form) {
  const errs = {};
  if (!form.name) errs.name = 'KPI Name is required.';
  if (!form.target) errs.target = 'Target is required.';
  if (!form.reportingPeriod) errs.reportingPeriod = 'Reporting Period is required.';
  if (form.currentValue && isNaN(Number(form.currentValue))) errs.currentValue = 'Current Value must be a number.';
  return errs;
}

export default function KpiEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getKpiById(id)
      .then((data) => {
        setForm({
          name: data.name || 'Utilization',
          target: data.target != null ? String(data.target) : '',
          reportingPeriod: data.reportingPeriod || 'Monthly',
          currentValue: data.currentValue != null ? String(data.currentValue) : '',
          notes: data.notes || '',
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
      const payload = {
        name: form.name,
        target: parseInt(form.target, 10),
        reportingPeriod: form.reportingPeriod,
        currentValue: form.currentValue ? parseFloat(form.currentValue) : 0,
        notes: form.notes.trim() || null,
      };
      
      await updateKpi(id, payload);
      setSuccess('KPI updated successfully.');
      setTimeout(() => navigate('/kpis', { state: { success: `KPI #${id} updated successfully.` } }), 1200);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button className="btn-export" onClick={() => navigate('/kpis')} style={{ flexShrink: 0, fontSize: 20, padding: '8px 12px' }}>
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2b45', margin: 0 }}>✏️ Edit KPI</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Update the KPI details below.</p>
          </div>
        </div>

        {loading && <div className="empty-state">Loading KPI...</div>}
        
        {/* Success banner */}
        {success && (
          <div className="success-banner">
            {success}
          </div>
        )}

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

        {!loading && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div className="form-row-2">
              <div className="form-field">
                <label>KPI Name <span className="required">*</span></label>
                <select name="name" value={form.name} onChange={handleField} className={formErrors.name ? 'input-error' : ''}>
                  <option value="">— Select KPI —</option>
                  {KPI_NAMES.map((name) => (<option key={name} value={name}>{name}</option>))}
                </select>
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>
              <div className="form-field">
                <label>Target <span className="required">*</span></label>
                <select name="target" value={form.target} onChange={handleField} className={formErrors.target ? 'input-error' : ''}>
                  <option value="">— Select Target —</option>
                  {TARGET_OPTIONS.map((val) => (<option key={val} value={val}>{val}%</option>))}
                </select>
                {formErrors.target && <span className="field-error">{formErrors.target}</span>}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>Reporting Period <span className="required">*</span></label>
                <select name="reportingPeriod" value={form.reportingPeriod} onChange={handleField} className={formErrors.reportingPeriod ? 'input-error' : ''}>
                  <option value="">— Select Period —</option>
                  {PERIOD_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
                {formErrors.reportingPeriod && <span className="field-error">{formErrors.reportingPeriod}</span>}
              </div>
              <div className="form-field">
                <label>Current Value <span style={{ fontSize: 12, color: '#94a3b8' }}>(optional)</span></label>
                <input type="number" name="currentValue" value={form.currentValue} onChange={handleField}
                  placeholder="e.g. 85.5" step="0.01" className={formErrors.currentValue ? 'input-error' : ''} />
                {formErrors.currentValue && <span className="field-error">{formErrors.currentValue}</span>}
              </div>
            </div>

            <div className="form-field">
              <label>Notes <span style={{ fontSize: 12, color: '#94a3b8' }}>(optional)</span></label>
              <textarea name="notes" value={form.notes} onChange={handleField} rows={3} placeholder="Add any additional details about this KPI..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid #e4e7ed', marginTop: 4 }}>
              <button className="btn-secondary" onClick={() => navigate('/kpis')}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Updating…' : 'Update'}
              </button>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}
