import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { getRoutingRuleById, updateRoutingRule, deleteRoutingRule, getAllRoutingRules } from '../../api/routingApi';
import ConfirmModal from '../../components/ConfirmModal';
import '../styles/Routing.css';
import '../../styles/Bookings.css';

export default function RoutingRuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false });

  const [formData, setFormData] = useState({
    name: '',
    priority: '',
    active: true,
    origin: '',
    destination: '',
    commodity: '',
  });

  const getRuleId = (item) => item?.ruleID ?? item?.ruleId ?? item?.id ?? null;

  const fetchRule = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      try {
        data = await getRoutingRuleById(id);
      } catch {
        const allRules = await getAllRoutingRules();
        data = (allRules || []).find((r) => String(getRuleId(r)) === String(id));
      }

      if (!data) {
        throw new Error('Rule not found');
      }

      setRule(data);
      const parsedConditions = parseConditions(data.conditionsJSON);
      setFormData({
        name: data.name ?? '',
        priority: data.priority ?? '',
        active: data.active ?? true,
        origin: readConditionValue(parsedConditions, 'Origin'),
        destination: readConditionValue(parsedConditions, 'Destination'),
        commodity: readConditionValue(parsedConditions, 'Commodity'),
      });
    } catch (err) {
      setError('Failed to load routing rule.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRule();
  }, [fetchRule]);

  useEffect(() => {
    const editParam = new URLSearchParams(location.search).get('edit');
    if (editParam === '1') {
      setIsEditing(true);
    }
  }, [location.search]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const conditionsPayload = {
        ...(formData.origin ? { origin: formData.origin.trim() } : {}),
        ...(formData.destination ? { destination: formData.destination.trim() } : {}),
        ...(formData.commodity ? { commodity: formData.commodity.trim() } : {}),
      };

      const payload = {
        name: formData.name,
        priority: formData.priority !== '' ? Number(formData.priority) : null,
        active: formData.active,
        conditionsJSON: Object.keys(conditionsPayload).length > 0 ? JSON.stringify(conditionsPayload) : '',
      };
      const updated = await updateRoutingRule(getRuleId(rule) ?? id, payload);
      setRule(updated);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const parsedConditions = parseConditions(rule.conditionsJSON);
    setFormData({
      name: rule.name ?? '',
      priority: rule.priority ?? '',
      active: rule.active ?? true,
      origin: readConditionValue(parsedConditions, 'Origin'),
      destination: readConditionValue(parsedConditions, 'Destination'),
      commodity: readConditionValue(parsedConditions, 'Commodity'),
    });
    setIsEditing(false);
    setError('');
  };

  const handleDelete = async () => {
    try {
      await deleteRoutingRule(getRuleId(rule) ?? id);
      navigate('/routing/rules');
    } catch (err) {
      setError('Failed to delete routing rule.');
    }
  };

  const parseConditions = (conditionsJSON) => {
    if (!conditionsJSON) return {};
    try {
      const parsed = JSON.parse(conditionsJSON);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
      return {};
    } catch {
      return {};
    }
  };

  const readConditionValue = (conditions, key) => {
    if (!conditions || typeof conditions !== 'object') return '';
    return conditions[key] ?? conditions[key.toLowerCase()] ?? '';
  };

  if (loading) {
    return (
      <Layout>
        <div className="routing-container">
          <div className="loading-spinner">Loading routing rule...</div>
        </div>
      </Layout>
    );
  }

  if (!rule && !loading) {
    return (
      <Layout>
        <div className="routing-container">
          <div className="alert alert-error">Routing rule not found.</div>
          <button className="btn btn-secondary" onClick={() => navigate('/routing/rules')}>
            ← 
          </button>
        </div>
      </Layout>
    );
  }

  const parsedConditionValues = parseConditions(rule?.conditionsJSON);
  const originValue = readConditionValue(parsedConditionValues, 'Origin');
  const destinationValue = readConditionValue(parsedConditionValues, 'Destination');
  const commodityValue = readConditionValue(parsedConditionValues, 'Commodity');

  return (
    <Layout>
      <div className="routing-container routing-rule-detail-page">
        {/* HEADER */}
        <div className="detail-header">
          <div className="detail-title-section">
            <h1 className="detail-title">Routing Rule #{getRuleId(rule)}</h1>
            <p className="detail-subtitle">{rule?.name || 'Rule Details'}</p>
          </div>
          
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* DETAIL / EDIT CARD */}
        <div className="routing-table-section routing-rule-detail-content" style={{ padding: '24px' }}>
          {!isEditing ? (
            /* VIEW MODE */
            <div className="detail-cards routing-rule-cards">
              <div className="detail-card info-card">
                <h3>Rule Information</h3>
                <div className="detail-row">
                  <span className="label">Rule ID:</span>
                  <span className="value">#{getRuleId(rule)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Name:</span>
                  <span className="value">{rule.name || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Priority:</span>
                  <span className="value">
                    <span
                      className={`status-badge ${
                        (rule.priority ?? 0) >= 8
                          ? 'status-optimized'
                          : (rule.priority ?? 0) >= 5
                          ? 'status-pending'
                          : 'status-completed'
                      }`}
                    >
                      {rule.priority ?? '-'}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className="value">
                    <span className={`status-badge ${rule.active ? 'rule-status-active' : 'rule-status-inactive'}`}>
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
              </div>

              <div className="detail-card availability-card">
                <h3>Conditions</h3>
                <div className="booking-table-wrap routing-rule-conditions-wrap">
                  <table className="booking-mini-table routing-rule-mini-table">
                    <thead>
                      <tr>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Commodity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{originValue || '-'}</td>
                        <td>{destinationValue || '-'}</td>
                        <td>{commodityValue || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <div className="booking-form-page">
              {/* ── Page Header ── */}
              <div className="form-page-header">
                <button className="back-btn" onClick={() => setIsEditing(false)}>←</button>
                <div>
                  <h1 className="page-title">Edit Routing Rule</h1>
                  <p className="page-subtitle">
                    Update rule conditions and settings
                  </p>
                </div>
              </div>

              {error && (
                <div className="error-banner">
                  <span>⚠️ {error}</span>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); setConfirmModal({ open: true, type: 'edit', title: 'Confirm Save', message: 'Do you want to save changes to this routing rule?', onConfirm: handleSave }); }} noValidate>
                <div className="form-section">
                  <h2 className="form-section-title">Rule Details</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="ruleName">Rule Name</label>
                      <input
                        id="ruleName"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. High Priority Pharma Rule"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="rulePriority">Priority (1–10)</label>
                      <input
                        id="rulePriority"
                        type="number"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="form-group routing-rule-toggle-group">
                      <input
                        type="checkbox"
                        id="activeToggle"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="activeToggle" className="routing-rule-toggle-label">
                        Active
                      </label>
                    </div>
                    <div className="routing-rule-conditions-columns">
                      <div className="form-group">
                        <label htmlFor="conditionOrigin">Origin</label>
                        <input
                          id="conditionOrigin"
                          type="text"
                          name="origin"
                          value={formData.origin}
                          onChange={handleInputChange}
                          placeholder="e.g. Mumbai"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="conditionDestination">Destination</label>
                        <input
                          id="conditionDestination"
                          type="text"
                          name="destination"
                          value={formData.destination}
                          onChange={handleInputChange}
                          placeholder="e.g. Delhi"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="conditionCommodity">Commodity</label>
                        <input
                          id="conditionCommodity"
                          type="text"
                          name="commodity"
                          value={formData.commodity}
                          onChange={handleInputChange}
                          placeholder="e.g. Pharma"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Footer Actions ── */}
                <div className="form-footer">
                  <div className="form-footer-spacer" />
                  <div className="form-footer-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        // Reset to original
                        const parsedConditions = parseConditions(rule.conditionsJSON);
                        setFormData({
                          name: rule.name || '',
                          priority: rule.priority || '',
                          active: rule.active ?? true,
                          origin: parsedConditions.origin || '',
                          destination: parsedConditions.destination || '',
                          commodity: parsedConditions.commodity || '',
                        });
                        setError('');
                      }}
                    >
                      Reset
                    </button>
                    <button type="submit" className="btn-primary">
                      {saving ? 'Updating…' : 'Update Rule'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmModal.open}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => { setConfirmModal({ open: false }); confirmModal.onConfirm?.(); }}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </Layout>
  );
}
