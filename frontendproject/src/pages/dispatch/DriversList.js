import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../../components/Layout';
import DashboardTemplate from '../../components/DashboardTemplate';
import Pagination1 from '../../components/Pagination1';
import {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../../api/dispatchApi';
import { DRIVER_STATUS_CONFIG } from '../../utils/constants';
import { exportCSV } from '../../utils/csvExport';
import '../../styles/Bookings.css';
import '../../styles/DispatchManifests.css';

// ── Validation ────────────────────────────────────────────────────────────────

function validateDriverForm(fields, isEditing = false) {
  const errors = {};//empty object to collect errors
  if (!fields.name.trim())        errors.name        = 'Name is required.';
  if (!isEditing && !fields.licenseNo.trim())   errors.licenseNo   = 'License number is required.';
  if (!fields.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required.';
  if (!fields.status)             errors.status      = 'Select a status.';
  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────
//empty form template for add/edit driver
const EMPTY_FORM = {
  name:         '',
  licenseNo:    '',
  contactInfo:  '',
  mobileNumber: '',
  status:       'AVAILABLE',
};

//pagination size
const PAGE_SIZE = 4;

//extract driver ID safely from various possible field names and formats
function getDriverId(driver) {
  const id = driver?.driverID ?? driver?.id ?? driver?.driverId;//check multiple possible fields for driver ID
  return Number(id) || 0;
}

export default function DriversList() {
  const [drivers, setDrivers]   = useState([]);//list of drivers
  const [loading, setLoading]   = useState(true);//loading state for API calls
  const [error, setError]       = useState('');//error message state
  const [search, setSearch]     = useState('');//search query state
  const [statusFilter, setStatusFilter] = useState('ALL');//status filter state
  const [currentPage, setCurrentPage] = useState(1);//current page for pagination

  // Modal state
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formFields, setFormFields]   = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [saving, setSaving]           = useState(false);
  const [formApiError, setFormApiError] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Delete confirmation
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Loaders ──────────────────────────────────────────────────────────────
 //callback hook to memoize the function that loads drivers from API
  const loadDrivers = useCallback(() => {
    setLoading(true);
    setError('');
    getAllDrivers()
      .then(setDrivers)
      .catch(() => setError('Could not load drivers. Is DispatchService running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadDrivers(); }, [loadDrivers]);

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filtered = drivers.filter((d) => { //d is variable representing each driver in the drivers array, we will filter based on search and status
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (d.name || '').toLowerCase().includes(q) ||
      (d.licenseNo || '').toLowerCase().includes(q) ||
      (d.mobileNumber || '').toLowerCase().includes(q) ||
      (d.contactInfo || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Reset page when search, filter, or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, drivers]);

  // ── Pagination ───────────────────────────────────────────────────────────

  const sortedDrivers = [...filtered].sort((a, b) => getDriverId(b) - getDriverId(a));
  const totalPages = Math.max(1, Math.ceil(sortedDrivers.length / PAGE_SIZE));//calculate total pages based on filtered drivers and page size
  const paginated = sortedDrivers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);//slice is used to get only the drivers for the current page based on currentPage and PAGE_SIZE

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = {
    total:       drivers.length,
    available:   drivers.filter((d) => d.status === 'AVAILABLE').length,
    assigned:    drivers.filter((d) => d.status === 'ASSIGNED').length,
    onRoute:     drivers.filter((d) => d.status === 'ON_ROUTE').length,
  };

  // ── Form handlers ─────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setFormFields(EMPTY_FORM);
    setFormErrors({});
    setFormApiError('');
    setSaving(false);
    setShowForm(true);
  };
  const openEdit = (driver) => {
    setEditingId(driver.driverID);
    setFormFields({
      name:         driver.name         || '',
      licenseNo:    driver.licenseNo    || '',
      contactInfo:  driver.contactInfo  || '',
      mobileNumber: driver.mobileNumber || '',
      status:       driver.status       || 'AVAILABLE',
    });
    setFormErrors({});
    setFormApiError('');
    setShowForm(true);
  };

  const NAME_FIELDS = ['name'];//fields that should be sanitized to remove special characters
  const handleChange = (e) => {
    const { name, value } = e.target;//name is the name of the form field, value is the current value of that field
    let sanitized = value;
    if (NAME_FIELDS.includes(name)) {
      sanitized = value.replace(/[^a-zA-Z0-9 ]/g, '');
    } else if (name === 'mobileNumber') {
      sanitized = value.replace(/[^0-9]/g, ''); // Only allow numbers
    }
    setFormFields((prev) => ({ ...prev, [name]: sanitized }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();//handle form submission for adding or editing a driver, it will validate the form and then call the appropriate API function to save the driver data
    setFormApiError('');
    setFormSuccessMessage('');
    const validationErrors = validateDriverForm(formFields, !!editingId);//validate the form fields, if editingId is present it means we are editing an existing driver, otherwise we are adding a new driver
    if (Object.keys(validationErrors).length > 0) { 
      setFormErrors(validationErrors);//if there are validation errors, set the formErrors state to display error messages and do not proceed with API call
      return;//if there are no validation errors, proceed to prepare the payload for API call
    }

    //payload is the data object that will be sent to the API
    const payload = {
      name:         formFields.name.trim(),
      mobileNumber: formFields.mobileNumber.trim(),
      contactInfo:  formFields.contactInfo.trim() || null,
      status:       formFields.status,
    };
    
    // Include licenseNo only on create, not on edit
    if (!editingId) {
      payload.licenseNo = formFields.licenseNo.trim();
    }

    setSaving(true);
    const apiCall = editingId
      ? updateDriver(editingId, payload)
      : createDriver(payload);

    apiCall
      .then(() => {
        const action = editingId ? 'updated' : 'added';
        setFormSuccessMessage(`Driver ${action} successfully!`);
        setTimeout(() => {
          setShowForm(false);
          setFormSuccessMessage('');
          loadDrivers();
        }, 1500);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.response?.data || 'Save failed.';
        setFormApiError(String(msg));
      })
      .finally(() => setSaving(false));
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = (id) => {
    if (!window.confirm('Delete this driver? This cannot be undone.')) return;
    deleteDriver(id)
      .then(() => { setOpenMenuId(null); loadDrivers(); })
      .catch(() => { setOpenMenuId(null); });
  };

  const handleExport = () => {
    const headers = ['Driver Name', 'License No', 'Mobile Number', 'Contact Info', 'Status'];
    const rows = sortedDrivers.map((driver) => [
      driver.name || '–',
      driver.licenseNo || '–',
      driver.mobileNumber || '–',
      driver.contactInfo || '–',
      driver.status || '–',
    ]);
    exportCSV('drivers.csv', headers, rows);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <DashboardTemplate
        title="Drivers"
        subtitle="Manage driver profiles and availability"
        actionButtonLabel="+"
        onActionButtonClick={openAdd}
        kpiCards={[
          { label: 'TOTAL DRIVERS', value: stats.total },
          { label: 'AVAILABLE', value: stats.available },
          { label: 'ASSIGNED', value: stats.assigned },
          { label: 'ON ROUTE', value: stats.onRoute },
        ]}
        contentCardTitle="All Drivers"
        searchPlaceholder="Search by name, license, mobile or contact…"
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'Status', value: 'ALL' },
              ...Object.entries(DRIVER_STATUS_CONFIG).map(([k, v]) => ({ label: v.label, value: k })),
            ],
            onChange: (e) => setStatusFilter(e.target.value),
          },
        ]}
        exportButtonLabel="Export"
        onExport={handleExport}
        loading={loading}
        error={error}
      >
        <div className="table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Driver ID</th>
                <th>Name</th>
                <th>License No</th>
                <th>Mobile</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    {drivers.length === 0
                      ? 'No drivers registered yet. Add a driver to get started.'
                      : 'No drivers match your search.'}
                  </td>
                </tr>
              ) : (
                paginated.map((driver) => {
                  const st = DRIVER_STATUS_CONFIG[driver.status] || { label: driver.status, cls: '' };
                  const isOpen = openMenuId === driver.driverID;
                  return (
                    <tr key={driver.driverID} className="table-row">
                      <td className="booking-id-cell">DR{String(driver.driverID).padStart(4, '0')}</td>
                      <td>{driver.name || '–'}</td>
                      <td>{driver.licenseNo || '–'}</td>
                      <td>{driver.mobileNumber || '–'}</td>
                      <td>{driver.contactInfo || '–'}</td>
                      <td>
                        <span className={`status-badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="actions-cell" ref={isOpen ? menuRef : null}>
                        <div className="action-menu" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="kebab-btn"
                            aria-label="Actions"
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(isOpen ? null : driver.driverID); }}
                          >
                            ⋯
                          </button>
                          {isOpen && (
                            <div className="kebab-dropdown">
                              <button className="kebab-item" onClick={() => { setOpenMenuId(null); openEdit(driver); }}>Edit</button>
                              <button className="kebab-item kebab-item-danger" onClick={(e) => { e.stopPropagation(); handleDelete(driver.driverID); }}>Delete</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <Pagination1
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            infoText={`Page ${currentPage} of ${totalPages}`}
          />
        )}
      </DashboardTemplate>

      {/* ── Add / Edit Driver Slide-in Panel ── */}
      {showForm && (
        <div
          className="claim-form-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="claim-form-panel">
            <h2>{editingId ? 'Edit Driver' : 'Add Driver'}</h2>

            <form onSubmit={handleSubmit} noValidate className="form-section">

              <div className="form-field">
                <label>Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formFields.name}
                  onChange={handleChange}
                  className={formErrors.name ? 'input-error' : ''}
                />
                {formErrors.name && <span className="error-msg">{formErrors.name}</span>}
              </div>

              {editingId ? (
                <div className="form-field">
                  <label>License No <span className="required">*</span></label>
                  <div style={{ padding: '8px 12px', background: '#f3f4f6', borderRadius: 6, border: '1px solid #e5e7eb', fontFamily: 'monospace' }}>
                    {formFields.licenseNo}
                  </div>
                  <span className="field-hint" style={{ fontSize: 12, color: '#6b7280', marginTop: 4, display: 'block' }}>License number cannot be changed after creation.</span>
                </div>
              ) : (
                <div className="form-field">
                  <label>License No <span className="required">*</span></label>
                  <input
                    type="text"
                    name="licenseNo"
                    placeholder="e.g. MH1234567"
                    value={formFields.licenseNo}
                    onChange={handleChange}
                    className={formErrors.licenseNo ? 'input-error' : ''}
                  />
                  {formErrors.licenseNo && <span className="error-msg">{formErrors.licenseNo}</span>}
                </div>
              )}

              <div className="form-field">
                <label>Mobile Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="mobileNumber"
                  placeholder="mobile number"
                  value={formFields.mobileNumber}
                  onChange={handleChange}
                  className={formErrors.mobileNumber ? 'input-error' : ''}
                />
                {formErrors.mobileNumber && <span className="error-msg">{formErrors.mobileNumber}</span>}
              </div>

              <div className="form-field">
                <label>Contact Info</label>
                <input
                  type="text"
                  name="contactInfo"
                  placeholder="Email or secondary contact"
                  value={formFields.contactInfo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>Status <span className="required">*</span></label>
                <select
                  name="status"
                  value={formFields.status}
                  onChange={handleChange}
                  className={formErrors.status ? 'input-error' : ''}
                >
                  {Object.entries(DRIVER_STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                {formErrors.status && <span className="error-msg">{formErrors.status}</span>}
              </div>

              {formSuccessMessage && (
                <div className="auth-message auth-message-success">✔ {formSuccessMessage}</div>
              )}
              {formApiError && (
                <div className="auth-message auth-message-error">⚠ {formApiError}</div>
              )}

              <div className="form-actions" style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
