import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createInvoice } from '../../api/billingApi';
import { getAllShippers } from '../../api/bookingsApi';
import '../../styles/Billing.css';
 
const STATUS_OPTIONS = ['Pending', 'Paid', 'Overdue', 'Cancelled', 'Draft', 'Issued'];
 
const EMPTY_FORM = {
  shipperID:   '',
  periodStart: '',
  periodEnd:   '',
  linesJSONArray: [{ item: '', amount: '' }],   // 👈 start with one empty line
  totalAmount: '',
  issuedAt:    '',
  status:      '',
};
 
 
function parseYMD(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}
 
function validate(form) {
  const errs = {};
 
  // Shipper ID checks
  if (!form.shipperID) {
    errs.shipperID = 'Shipper ID is required.';
  } else if (isNaN(Number(form.shipperID)) || !Number.isInteger(Number(form.shipperID)) || Number(form.shipperID) <= 0) {
    errs.shipperID = 'Shipper ID must be a positive whole number (e.g. 501).';
  }
 
  // Period checks
  if (!form.periodStart) errs.periodStart = 'Period start is required. Please select a date.';
  if (!form.periodEnd) {
    errs.periodEnd = 'Period end is required. Please select a date.';
  } else if (form.periodStart && form.periodEnd && form.periodEnd < form.periodStart) {
    errs.periodEnd = 'Period end must be on or after Period start.';
  }
 
  // Billing Lines checks
  if (!form.linesJSONArray || form.linesJSONArray.length === 0) {
    errs.linesJSON = 'Billing lines are required. Add at least one item.';
  } else {
    form.linesJSONArray.forEach((line, idx) => {
      if (!line.item || !line.amount) {
        errs.linesJSON = `Line ${idx + 1} must have both Item and Amount.`;
      } else if (Number(line.amount) <= 0) {
        errs.linesJSON = `Line ${idx + 1} amount must be greater than 0.`;
      }
    });
  }
 
  // Total Amount checks
  if (!form.totalAmount) {
    errs.totalAmount = 'Total amount is required.';
  } else if (isNaN(Number(form.totalAmount)) || Number(form.totalAmount) <= 0) {
    errs.totalAmount = 'Total amount must be a number greater than 0.';
  }
 
  // Issued At checks
  if (form.issuedAt) {
    const d = parseYMD(form.issuedAt);
    if (!d) {
      errs.issuedAt = 'Please select a valid issued date.';
    } else {
      const today = new Date(); today.setHours(23, 59, 59, 999);
      if (d > today) errs.issuedAt = 'Issued date cannot be a future date.';
    }
  }
 
  // Status check
  if (!form.status) errs.status = 'Please select a status.';
 
  return errs;
}
 
 
export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [shippers, setShippers] = useState([]);

  useEffect(() => {
    const fetchShippers = async () => {
      try {
        const shippersData = await getAllShippers();
        setShippers(shippersData);
      } catch (err) {
        console.error('Failed to fetch shippers:', err);
      }
    };
    fetchShippers();
  }, []);
 
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
      shipperID:   parseInt(form.shipperID, 10),
      periodStart: `${form.periodStart}T00:00:00`,
      periodEnd:   `${form.periodEnd}T23:59:59`,
      linesJSON:   JSON.stringify(
        (form.linesJSONArray || []).map(line => ({
          description: line.item,
          lineTotal: parseFloat(line.amount)
        }))
      ),
      totalAmount: parseFloat(form.totalAmount),
      issuedAt:    form.issuedAt ? `${form.issuedAt}T00:00:00` : new Date().toISOString().substring(0, 19),
      status:      form.status,
    };
    await createInvoice(payload);
    navigate('/billing/invoices', { state: { success: 'Invoice created successfully.' } });
  } catch (e) {
    setError(e.message);
    setSaving(false);
  }
  };
 
  return (
    <Layout>
      <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '24px 16px' }}>
 
        {/* ── Page Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button className="btn-export" onClick={() => navigate('/billing/invoices')} style={{ flexShrink: 0, fontSize: 20, padding: '8px 12px' }}>
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2b45', margin: 0 }}>🧾 New Invoice</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Fill in all required fields to create a new invoice.</p>
          </div>
        </div>
 
       
        {/* ── Form Card ── */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '32px 36px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 20,
        }}>
 
          {/* Shipper ID */}
          <div className="form-field">
            <label>Shipper <span className="required">*</span></label>
            <select
              name="shipperID"
              value={form.shipperID}
              onChange={handleField}
              className={formErrors.shipperID ? 'input-error' : ''}
            >
              <option value="">-- Select Shipper --</option>
              {shippers.map((shipper) => (
                <option key={shipper.shipperID || shipper.id} value={shipper.shipperID || shipper.id}>
                  {shipper.name}
                </option>
              ))}
            </select>
            {formErrors.shipperID && <span className="field-error">{formErrors.shipperID}</span>}
          </div>
 
          {/* Period Start & End */}
          <div className="form-row-2">
            <div className="form-field">
              <label>Period Start <span className="required">*</span></label>
              <input
                type="date" name="periodStart" value={form.periodStart}
                onChange={handleField}
                className={formErrors.periodStart ? 'input-error' : ''}
              />
              {formErrors.periodStart && <span className="field-error">{formErrors.periodStart}</span>}
            </div>
            <div className="form-field">
              <label>Period End <span className="required">*</span></label>
              <input
                type="date" name="periodEnd" value={form.periodEnd}
                onChange={handleField} min={form.periodStart || undefined}
                className={formErrors.periodEnd ? 'input-error' : ''}
              />
              {formErrors.periodEnd && <span className="field-error">{formErrors.periodEnd}</span>}
            </div>
          </div>
 
          {/* Total Amount */}
          <div className="form-field">
            <label>Total Amount (₹) <span className="required">*</span></label>
            <input
              type="number" name="totalAmount" value={form.totalAmount}
              onChange={handleField} min="0.01" step="0.01" placeholder="0.00"
              className={formErrors.totalAmount ? 'input-error' : ''}
            />
            {formErrors.totalAmount && <span className="field-error">{formErrors.totalAmount}</span>}
          </div>
{/* Billing Lines */}
<div className="form-field">
  <label>Billing Lines <span className="required">*</span></label>
 
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {(form.linesJSONArray || []).map((line, idx) => (
      <div
        key={idx}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: 12,
          alignItems: 'flex-start',
          marginBottom: 8,
        }}
      >
        {/* Item column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Item</label>
          <input
            type="text"
            value={line.item}
            onChange={(e) => {
              const updated = [...form.linesJSONArray];
              updated[idx].item = e.target.value;
              setForm((p) => ({ ...p, linesJSONArray: updated }));
              setFormErrors((p) => ({ ...p, linesJSON: undefined }));
            }}
            placeholder="e.g. Freight Charge"
            style={{ padding: '8px', boxSizing: 'border-box', width: '100%', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>
 
        {/* Amount column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Amount (₹)</label>
          <input
            type="number"
            value={line.amount}
            onChange={(e) => {
              const updated = [...form.linesJSONArray];
              updated[idx].amount = e.target.value;
              setForm((p) => ({ ...p, linesJSONArray: updated }));
              setFormErrors((p) => ({ ...p, linesJSON: undefined }));
            }}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            style={{ padding: '8px', boxSizing: 'border-box', width: '100%', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>
 
        {/* + icon to add new line */}
        <button
          type="button"
          className="btn-add-new"
          style={{ marginTop: '22px' }}
          onClick={() => {
            // Validate current line before adding new one
            if (!line.item || !line.item.trim()) {
              setFormErrors((p) => ({ ...p, linesJSON: `Line ${idx + 1}: Item is required.` }));
              return;
            }
            if (!line.amount || Number(line.amount) <= 0) {
              setFormErrors((p) => ({ ...p, linesJSON: `Line ${idx + 1}: Amount must be greater than 0.` }));
              return;
            }
            // If validation passes, add new line
            setForm((p) => ({
              ...p,
              linesJSONArray: [...(p.linesJSONArray || []), { item: '', amount: '' }],
            }));
            setFormErrors((p) => ({ ...p, linesJSON: undefined }));
          }}
        >
          +
        </button>
      </div>
    ))}
  </div>
 
  {formErrors.linesJSON && <span className="field-error">{formErrors.linesJSON}</span>}
</div>
 
          {/* Issued At & Status */}
          <div className="form-row-2">
            <div className="form-field">
              <label>Issued At <span style={{ fontSize: 11, color: '#94a3b8' }}>(optional)</span></label>
              <input
                type="date" name="issuedAt" value={form.issuedAt}
                onChange={handleField} max={new Date().toISOString().split('T')[0]}
                className={formErrors.issuedAt ? 'input-error' : ''}
              />
              {formErrors.issuedAt && <span className="field-error">{formErrors.issuedAt}</span>}
              {!form.issuedAt && !formErrors.issuedAt && (
                <span style={{ fontSize: 11, color: '#f59e0b' }}>⚠ If not set, today's date will be used.</span>
              )}
            </div>
            <div className="form-field">
              <label>Status <span className="required">*</span></label>
              <select name="status" value={form.status} onChange={handleField}
                className={formErrors.status ? 'input-error' : ''}>
                <option value="">-- Select Status --</option>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
              {formErrors.status && <span className="field-error">{formErrors.status}</span>}
            </div>
          </div>
 
          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid #e4e7ed', marginTop: 4 }}>
            <button className="btn-secondary" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); }}>Reset</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '⏳ Saving…' : 'Create'}
            </button>
          </div>
 
        </div>
      </div>
    </Layout>
  );
}
 
 