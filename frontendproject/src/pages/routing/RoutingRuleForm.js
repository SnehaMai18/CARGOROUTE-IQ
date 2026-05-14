import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createRoutingRule } from '../../api/routingApi';
import '../styles/Routing.css';
import '../../styles/Bookings.css';

export default function RoutingRuleForm() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    conditionsJSON: '',
    priority: '',
    active: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Rule name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        priority: formData.priority !== '' ? Number(formData.priority) : null,
      };
      await createRoutingRule(payload);
      navigate('/routing/rules');
    } catch (err) {
      setError('Failed to create routing rule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="booking-form-page">
        {/* HEADER */}
        <div className="form-page-header">
          <button className="back-btn" onClick={() => navigate('/routing/rules')}>←</button>
          <div>
            <h1 className="page-title">Create Routing Rule</h1>
            <p className="page-subtitle">Define a new automated routing rule</p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section">
            <h2 className="form-section-title">Rule Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="label">
                  Rule Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. High Priority Pharma Rule"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Priority (1–10)</label>
                <input
                  className="form-input"
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  placeholder="e.g. 8"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '28px' }}>
                <input
                  type="checkbox"
                  id="activeToggle"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="activeToggle" className="label" style={{ margin: 0, cursor: 'pointer' }}>
                  Active
                </label>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Conditions JSON</label>
                <textarea
                  className="form-input"
                  name="conditionsJSON"
                  value={formData.conditionsJSON}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder='{"origin": "Mumbai", "destination": "Delhi", "commodity": "Pharma"}'
                  style={{ fontFamily: 'monospace', fontSize: '13px', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          <div className="form-footer">
            <div className="form-footer-spacer" />
            <div className="form-footer-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFormData({
                    name: '',
                    conditionsJSON: '',
                    priority: '',
                    active: true,
                  });
                  setError('');
                }}
                disabled={saving}
              >
                Reset
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Creating…' : 'Create Rule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
