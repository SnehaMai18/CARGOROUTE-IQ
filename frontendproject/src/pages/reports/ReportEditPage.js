import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../auth/AuthContext';
import { getReportById, updateReport } from '../../api/reportApi';
import '../../styles/Reports.css';

const SCOPE_OPTIONS = [
  { value: 'ONTIME',      label: 'On-Time Delivery' },
  { value: 'REVENUE',     label: 'Revenue' },
  { value: 'UTILIZATION', label: 'Utilization' },
  { value: 'EXCEPTIONS',  label: 'Exceptions' },
];

const EMPTY_FORM = { 
  scope: 'ONTIME', 
  dateFrom: '', 
  dateTo: '', 
  metricsJSON: ''
};

function validate(form) {
  const errs = {};
  if (!form.scope) errs.scope = 'Report Scope is required.';
  if (!form.dateFrom) errs.dateFrom = 'Date From is required.';
  if (!form.dateTo) errs.dateTo = 'Date To is required.';
  if (form.dateFrom && form.dateTo && form.dateTo < form.dateFrom) errs.dateTo = 'Date To must be after Date From.';
  if (!form.metricsJSON.trim()) errs.metricsJSON = 'Metrics JSON is required.';
  
  // Try to parse JSON
  try {
    JSON.parse(form.metricsJSON);
  } catch (e) {
    errs.metricsJSON = 'Invalid JSON format.';
  }
  return errs;
}

export default function ReportEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getReportById(id)
      .then((data) => {
        const report = data.report || data;
        const parametersJSON = report.parametersJSON ? JSON.parse(report.parametersJSON) : {};
        setForm({
          scope: report.scope || 'ONTIME',
          dateFrom: parametersJSON.dateFrom || '',
          dateTo: parametersJSON.dateTo || '',
          metricsJSON: report.metricsJSON || '',
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
        scope: form.scope,
        parametersJSON: JSON.stringify({
          dateFrom: form.dateFrom,
          dateTo: form.dateTo
        }),
        metricsJSON: form.metricsJSON.trim(),
        generatedBy: user?.name || 'System',
        generatedAt: new Date().toISOString()
      };
      
      await updateReport(id, payload, user?.name || '', user?.role || '');
      setSuccess('Report updated successfully.');
      setTimeout(() => navigate('/reports'), 1200);
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
          <button className="btn-export" onClick={() => navigate('/reports')} style={{ flexShrink: 0, fontSize: 20, padding: '8px 12px' }}>
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2b45', margin: 0 }}>✏️ Edit Report</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Update the report details below.</p>
          </div>
        </div>

        {loading && <div className="empty-state">Loading report...</div>}
        {error   && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
        {success && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#16a34a' }}>✅ {success}</div>}

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
                  <label>Report Scope <span className="required">*</span></label>
                  <select name="scope" value={form.scope} onChange={handleField} className={formErrors.scope ? 'input-error' : ''}>
                    <option value="">— Select Scope —</option>
                    {SCOPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                  {formErrors.scope && <span className="field-error">{formErrors.scope}</span>}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Date From <span className="required">*</span></label>
                  <input type="date" name="dateFrom" value={form.dateFrom} onChange={handleField}
                    className={formErrors.dateFrom ? 'input-error' : ''} />
                  {formErrors.dateFrom && <span className="field-error">{formErrors.dateFrom}</span>}
                </div>
                <div className="form-field">
                  <label>Date To <span className="required">*</span></label>
                  <input type="date" name="dateTo" value={form.dateTo} onChange={handleField}
                    className={formErrors.dateTo ? 'input-error' : ''} />
                  {formErrors.dateTo && <span className="field-error">{formErrors.dateTo}</span>}
                </div>
              </div>

              <div className="form-field">
                <label>Metrics JSON <span className="required">*</span></label>
                <textarea name="metricsJSON" value={form.metricsJSON} onChange={handleField} rows={8} 
                  placeholder={'{\n  "totalBookings": 100,\n  "onTimeBookings": 95,\n  "onTimePercentage": 95.0\n}'} 
                  className={formErrors.metricsJSON ? 'input-error' : ''} 
                  style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                {formErrors.metricsJSON && <span className="field-error">{formErrors.metricsJSON}</span>}
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Generated By</label>
                  <input type="text" value={user?.name || 'System'} disabled style={{ background: '#f3f4f6', color: '#64748b' }} />
                </div>
                <div className="form-field">
                  <label>Generated At</label>
                  <input type="text" value={new Date().toLocaleString('en-GB')} disabled style={{ background: '#f3f4f6', color: '#64748b' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid #e4e7ed', marginTop: 4 }}>
                <button className="btn-secondary" onClick={() => setForm(EMPTY_FORM)}>Reset</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Updating…' : 'Update'}
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
