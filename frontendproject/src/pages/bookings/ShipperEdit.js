import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getShipperById, updateShipper } from '../../api/bookingsApi';
import { SHIPPER_STATUS_CONFIG } from '../../utils/constants';
import '../../styles/Bookings.css';

const EMPTY_FORM = { name: '', contactInfo: '', accountTerms: '', status: 'ACTIVE' };

function validateShipperForm(form) {
  const err = {};
  if (!form.name.trim()) err.name = 'Shipper name is required';
  return err;
}

export default function ShipperEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [originalForm, setOriginalForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getShipperById(id)
      .then((s) => {
        const loadedForm = { name: s.name || '', contactInfo: s.contactInfo || '', accountTerms: s.accountTerms || '', status: s.status || 'ACTIVE' };
        setForm(loadedForm);
        setOriginalForm(loadedForm);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleReset = () => {
    setForm(originalForm);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateShipperForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await updateShipper(id, form);
      navigate('/shippers');
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Failed to save' });
    } finally { setSaving(false); }
  };

  if (loading) return <Layout><div className="empty-state">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="booking-form-page">
        <div className="form-page-header">
          <button className="back-btn" onClick={() => navigate('/shippers')}>←</button>
          <div>
            <h1 className="page-title">Edit Shipper</h1>
            <p className="page-subtitle">Update shipper account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section">
            <div className="form-row form-row-2">
              <div className="form-field">
                <label>Name <span className="required">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>
              <div className="form-field">
                <label>Contact Info</label>
                <input name="contactInfo" value={form.contactInfo} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row form-row-2" style={{ marginTop: 12 }}>
              <div className="form-field">
                <label>Account Terms</label>
                <input name="accountTerms" value={form.accountTerms} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  {Object.entries(SHIPPER_STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions-row" style={{ marginTop: 16 }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={handleReset} style={{ marginLeft: 12, textTransform: 'none' }}>Reset</button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
