import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createShipper } from '../../api/bookingsApi';
import '../../styles/Bookings.css';

const EMPTY_FORM = { name: '', contactInfo: '', accountTerms: '', status: 'ACTIVE' };

function validateShipperForm(form) {
  const err = {};
  if (!form.name.trim()) err.name = 'Shipper name is required';
  return err;
}

export default function NewShipper() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateShipperForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await createShipper(form);
      setMessage({ type: 'success', text: 'Shipper created. Redirecting…' });
      setTimeout(() => navigate('/shippers'), 900);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create shipper.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="booking-form-page">
        <div className="form-page-header">
          <button className="back-btn" onClick={() => navigate('/shippers')}>←</button>
          <div>
            <h1 className="page-title">Add Shipper</h1>
            <p className="page-subtitle">Create a new shipper account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section">
            <h2 className="form-section-title">Shipper Information</h2>

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
                <input name="accountTerms" value={form.accountTerms} onChange={handleChange} placeholder="e.g., NET30" />
              </div>
              <div className="form-field" aria-hidden="true" style={{ visibility: 'hidden' }} />
            </div>

            {message.text && (
              <div className={`auth-message auth-message-${message.type}`} style={{ marginTop: 12 }}>
                {message.text}
              </div>
            )}

            <div className="form-actions-row" style={{ marginTop: 20 }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Add'}</button>
              <button type="button" className="btn-secondary" onClick={handleReset} style={{ marginLeft: 12, textTransform: 'none' }}>Reset</button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
