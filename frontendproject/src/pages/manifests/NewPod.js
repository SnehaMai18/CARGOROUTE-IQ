import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import Layout from '../../components/Layout';
import { createPod, createPodWithImage } from '../../api/manifestApi';
import { getAllDrivers } from '../../api/dispatchApi';
import { POD_STATUS_CONFIG, POD_TYPE_CONFIG } from '../../utils/constants';
import '../../styles/Bookings.css';
import '../../styles/DispatchManifests.css';
import '../../styles/NewPod.css';
const EMPTY_FORM = {
  bookingID:    '',
  receivedBy:   '',
  podType:      'Photo',
  status:       'PENDING',
  deliveredAt:  '',
  podURI:       '',
  file:         null,
  fileName:     '',
};
 


function toLocalDateTime(val) {
  if (!val) return null;
  return val.length === 16 ? `${val}:00` : val;
}
 
function validateForm(form) {
  const errors = {};
  const bookingIdNumber = Number(form.bookingID);
  if (!bookingIdNumber || bookingIdNumber <= 0) errors.bookingID = 'Valid Booking ID is required.';
  if (!form.receivedBy.trim()) errors.receivedBy = 'Received By is required.';
  return errors;
}
 
export default function NewPod() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [drivers, setDrivers] = useState([]);
  const [actualDriverId, setActualDriverId] = useState(null);
 
  // Check if current user is a Driver
  const isDriver = user?.role?.toLowerCase() === 'driver';
  const userId = user?.userId;
 
  // Load drivers and find actual driver ID
  useEffect(() => {
    getAllDrivers()
      .then((driversList) => {
        setDrivers(driversList);
        // Try to find driver by userId or name match
        if (isDriver && userId) {
          const matchedDriver = driversList.find(
            (d) => String(d.driverID) === String(userId) ||
                   d.name?.toLowerCase() === user?.name?.toLowerCase()
          );
          if (matchedDriver) {
            console.log('Found matching driver record:', {
              userId,
              driverId: matchedDriver.driverID,
              driverName: matchedDriver.name
            });
            setActualDriverId(matchedDriver.driverID);
          } else {
            console.warn('No matching driver record found for user:', {
              userId,
              userName: user?.name,
              availableDrivers: driversList.map(d => ({ id: d.driverID, name: d.name }))
            });
          }
        }
      })
      .catch((err) => console.error('Error loading drivers:', err));
  }, [isDriver, userId, user?.name]);
 
 
  const NAME_FIELDS = ['receivedBy'];
  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = NAME_FIELDS.includes(name) ? value.replace(/[^a-zA-Z0-9 ]/g, '') : value;
    setForm((prev) => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };
 
  const MAX_IMG_MB = 2;
  const MAX_IMG_SIZE = MAX_IMG_MB * 1024 * 1024;
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_IMG_SIZE) {
      setMessage({ type: 'error', text: `The selected image is too large. Maximum file size is ${MAX_IMG_MB} MB.` });
      e.target.value = '';
      return;
    }
 
    setForm((prev) => ({ ...prev, file, fileName: file.name }));
    setMessage({ type: 'success', text: `Selected file: ${file.name}` });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
 
    // For drivers: ensure they have actualDriverId
    if (isDriver && !actualDriverId) {
      setMessage({ type: 'error', text: 'Unable to find your driver profile. Please contact your administrator.' });
      return;
    }
 
    setSubmitting(true);
    setMessage({ type: '', text: '' });
 
    const payload = {
      bookingID:  Number(form.bookingID),
      receivedBy: form.receivedBy.trim(),
      podType:    form.podType,
      status:     form.status,
      driverId:   actualDriverId || user?.userId || null, // Use matched driver ID
      podURI:     form.podURI.trim() || null,
      deliveredAt: form.deliveredAt ? toLocalDateTime(form.deliveredAt) : null,
    };
    try {
      const created = form.file
        ? await createPodWithImage(payload, form.file)//await is used to wait for the promise returned by createPodWithImage to resolve, and then assigns the resolved value to created. This allows us to handle the asynchronous operation of uploading the image and creating the POD in a synchronous-like manner.
        : await createPod(payload);
 
      setMessage({ type: 'success', text: 'POD created successfully. Redirecting…' });
      const nextPath = created?.podID ? `/pod/${created.podID}` : '/pod';
      setTimeout(() => navigate(nextPath), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create POD. Please try again.' });
      setSubmitting(false);
    }
  };
 
  return (
    <Layout>
      <div className="booking-form-page manifests-page">
        <div className="form-page-header">
          <button className="back-btn" onClick={() => navigate('/pod')}>←</button>
          <div>
            <h1 className="page-title">New Proof of Delivery</h1>
            <p className="page-subtitle">Create a new POD record for a booking.</p>
          </div>
        </div>
 
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section">
            <h2 className="form-section-title">POD Information</h2>
            <div className="form-row form-row-2">
              <div className="form-field">
                <label>Booking ID <span className="required">*</span></label>
                <input
                  type="number"
                  name="bookingID"
                  value={form.bookingID}
                  onChange={handleChange}
                  placeholder="e.g. 123"
                  min="1"
                  className={errors.bookingID ? 'input-error' : ''}
                />
                {errors.bookingID && <span className="error-msg">{errors.bookingID}</span>}
              </div>
              <div className="form-field">
                <label>Received By <span className="required">*</span></label>
                <input
                  type="text"
                  name="receivedBy"
                  value={form.receivedBy}
                  onChange={handleChange}
                  placeholder="Receiver name"
                  className={errors.receivedBy ? 'input-error' : ''}
                />
                {errors.receivedBy && <span className="error-msg">{errors.receivedBy}</span>}
              </div>
            </div>
 
            <div className="form-row form-row-2">
              <div className="form-field">
                <label>POD Type</label>
                <select name="podType" value={form.podType} onChange={handleChange}>
                  {Object.entries(POD_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  {Object.entries(POD_STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
 
            <div className="form-row form-row-2">
              <div className="form-field">
                <label>Delivered At</label>
                <input
                  type="datetime-local"
                  name="deliveredAt"
                  value={form.deliveredAt}
                  onChange={handleChange}
                />
              </div>
              <div className="form-field">
                <label>POD Image</label>
                <div className="pod-form-flex-container">
                  <label className="pod-image-label" style={{ cursor: submitting ? 'not-allowed' : 'pointer' , color: 'white'}}>
                    Choose image
                    <input
                      type="file"
                      accept="image/*"
                      className="pod-file-input"
                      disabled={submitting}
                      onChange={handleFileChange}
                    />
                  </label>
                  {form.fileName && (
                    <span className="pod-file-name">
                      {form.fileName}
                    </span>
                  )}
                </div>
                <p className="pod-file-info">
                  Optional. Maximum file size is <strong>2 MB</strong>.
                </p>
              </div>
            </div>
 
            
          </div>
 
          {message.text && (
            <div className={`auth-message auth-message-${message.type === 'success' ? 'success' : 'error'} pod-message`}>
              {message.text}
            </div>
          )}
 
          <div className="pod-button-group">
            <button type="submit" className="create-button" disabled={submitting}>
              {submitting ? 'Saving…' : 'Create POD'}
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate('/pod')} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
 