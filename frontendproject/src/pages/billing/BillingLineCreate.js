import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createBillingLine } from '../../api/billingApi';
import { getAllBookings } from '../../api/bookingsApi';
import '../../styles/Billing.css';

const EMPTY_FORM = { bookingID: '', loadID: '', amount: '', tariffApplied: '', notes: '' };

function validate(form) {
  const errs = {};
  if (!form.bookingID) {
    errs.bookingID = 'Booking selection is required.';
  }
  if (!form.loadID) {
    errs.loadID = 'Load ID is required.';
  } else if (isNaN(Number(form.loadID)) || Number(form.loadID) <= 0) {
    errs.loadID = 'Load ID must be a positive number.';
  }
  if (!form.amount) {
    errs.amount = 'Amount is required.';
  } else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
    errs.amount = 'Amount must be greater than 0.';
  }
  if (!form.tariffApplied.trim()) errs.tariffApplied = 'Tariff applied is required.';
  return errs;
}

export default function BillingLineCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log('Fetching bookings from API...');
        const bookingsData = await getAllBookings();
        console.log('Fetched bookings data:', bookingsData);
        console.log('Type of bookingsData:', typeof bookingsData);
        console.log('Is array?', Array.isArray(bookingsData));
        if (Array.isArray(bookingsData)) {
          console.log('Number of bookings:', bookingsData.length);
          setBookings(bookingsData);
        } else {
          console.log('Bookings data is not an array, setting to empty array');
          setBookings([]);
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        console.error('Error details:', err.response ? err.response.data : err.message);
        setError(`Failed to load bookings: ${err.message}`);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    console.log('Bookings state changed:', bookings);
  }, [bookings]);

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createBillingLine({
        bookingID: parseInt(form.bookingID, 10),
        loadID: form.loadID ? parseInt(form.loadID, 10) : null,
        amount: parseFloat(form.amount),
        tariffApplied: form.tariffApplied.trim(),
        notes: form.notes.trim(),
      });
      navigate('/billing/billing-lines', { state: { success: 'Billing line created successfully.' } });
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
          <button
            className="btn-export"
            onClick={() => navigate('/billing/billing-lines')}
            style={{ flexShrink: 0, fontSize: 20, padding: '8px 12px' }}
          >
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2b45', margin: 0 }}>📋 New Billing Line</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Fill in all required fields to create a billing line.</p>
          </div>
        </div>

        {/* Global Error Display */}
        {error && <div style={{ color: 'red', marginBottom: 16, fontWeight: 'bold' }}>{error}</div>}

        {/* Form card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Booking Selection */}
            <div className="form-field">
              <label>Booking <span className="required">*</span></label>
              <select
                name="bookingID"
                value={form.bookingID}
                onChange={handleField}
                className={formErrors.bookingID ? 'input-error' : ''}
              >
                <option value="">-- Select Booking --</option>
                {bookings && bookings.length > 0 ? (
                  bookings.map((booking) => {
                    console.log('Rendering booking:', booking);
                    return (
                      <option key={booking.bookingID} value={booking.bookingID}>
                        {`BK${String(booking.bookingID).padStart(3, '0')}`} - {booking.shipper?.name || 'Unknown Shipper'}
                      </option>
                    );
                  })
                ) : (
                  <option disabled>No bookings available</option>
                )}
              </select>
              {formErrors.bookingID && <span className="field-error">{formErrors.bookingID}</span>}
            </div>

            {/* Load ID */}
            <div className="form-field">
              <label>Load ID <span className="required">*</span></label>
              <input
                type="number"
                name="loadID"
                value={form.loadID}
                onChange={handleField}
                placeholder="e.g. 5"
                min="1"
                className={formErrors.loadID ? 'input-error' : ''}
              />
              {formErrors.loadID && <span className="field-error">{formErrors.loadID}</span>}
            </div>
          </div>

          <div className="form-field">
            <label>Amount (₹) <span className="required">*</span></label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleField}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className={formErrors.amount ? 'input-error' : ''}
            />
            {formErrors.amount && <span className="field-error">{formErrors.amount}</span>}
          </div>

          <div className="form-field">
            <label>Tariff Applied <span className="required">*</span></label>
            <input
              name="tariffApplied"
              value={form.tariffApplied}
              onChange={handleField}
              placeholder="e.g. Standard Freight @ 2.5/kg"
              className={formErrors.tariffApplied ? 'input-error' : ''}
            />
            {formErrors.tariffApplied && <span className="field-error">{formErrors.tariffApplied}</span>}
          </div>

          <div className="form-field">
            <label>Notes <span style={{ fontSize: 12, color: '#94a3b8' }}></span></label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleField}
              rows={3}
              placeholder="Any remarks..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid #e4e7ed', marginTop: 4 }}>
            <button className="btn-secondary" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); }}>Reset</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '⏳ Saving…' : '📋 Create'}
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}