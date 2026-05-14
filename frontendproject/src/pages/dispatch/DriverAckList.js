import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import Layout from '../../components/Layout';
import DashboardTemplate from '../../components/DashboardTemplate';
import Pagination1 from '../../components/Pagination1';
import ActionMenuPortal from '../../components/ActionMenuPortal';
import {
  getAllAcknowledgements,
  getAcknowledgementByDriver,
  createAcknowledgement,
  updateAcknowledgement,
  deleteAcknowledgement,
  getAllDispatches,
  getAllDrivers,
} from '../../api/dispatchApi';
import { DISPATCH_STATUS_CONFIG, DRIVER_STATUS_CONFIG } from '../../utils/constants';
import { exportCSV } from '../../utils/csvExport';
import '../../styles/Bookings.css';
import '../../styles/DispatchManifests.css';
import '../../styles/DriverAckList.css';
import '../../styles/Fleet.css';
// ── Formatters ────────────────────────────────────────────────────────────────
 
function formatDispatchId(id) {
  return id ? `DS${String(id).padStart(4, '0')}` : '–';
}
function formatDateTime(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
 
// ── Validation ────────────────────────────────────────────────────────────────
 
function validateForm(fields) {
  const errors = {};
  if (!fields.dispatchID) errors.dispatchID = 'Select a dispatch.';
  if (!fields.driverID) errors.driverID = 'Select a driver.';
  return errors;
}
 
const EMPTY_FORM = { dispatchID: '', driverID: '', notes: '' };
 
// ── Component ─────────────────────────────────────────────────────────────────
 
const PAGE_SIZE = 4;
 
export default function DriverAckList() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
 
  // Check if current user is a Driver
  const isDriver = user?.role?.toLowerCase() === 'driver';
  const userId = user?.userId;
 
  const [acks, setAcks]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [currentPage, setCurrentPage] = useState(1);
 
  // dropdowns - DECLARE BEFORE USING IN EFFECTS
  const [dispatches, setDispatches] = useState([]);
  const [drivers, setDrivers]       = useState([]);
 
  // Find driver's actual driverId from drivers list
  const [actualDriverId, setActualDriverId] = useState(null);
 
  useEffect(() => {
    if (isDriver && userId && drivers.length > 0) {
      // Try to find driver by userId or name match
      const matchedDriver = drivers.find(
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
          availableDrivers: drivers.map(d => ({ id: d.driverID, name: d.name }))
        });
      }
    }
  }, [isDriver, userId, drivers, user?.name]);
 
  // form panel
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formFields, setFormFields]   = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [saving, setSaving]           = useState(false);
  const [formApiError, setFormApiError] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
 
  // acknowledgement detail view
  const [showDetail, setShowDetail]     = useState(false);
  const [selectedAck, setSelectedAck]   = useState(null);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadData = useCallback(() => {//useCallback is used to memoize the loadData function so that it doesn't get recreated on every render, which can help prevent unnecessary re-fetching of data or re-running of effects that depend on this function. This is especially important because loadData is a dependency of the useEffect hook that loads data when the component mounts or when certain dependencies change.
    setLoading(true);
    setError('');
   
    // Debug logging
    console.log('LoadData - Role Check:', {//this log will help us verify whether the component correctly identifies the user's role and driver ID, which is crucial for loading the appropriate acknowledgements.
      isDriver,
      actualDriverId,
      userRole: user?.role,
      userId: user?.userId,
    });
   
    // Load acknowledgements based on role
    let ackPromise;//we will load acknowledgements differently based on whether the user is a driver or dispatcher. Drivers will only see their own acknowledgements, while dispatchers will see all.
    if (isDriver && actualDriverId) {
      console.log('Loading acknowledgements for driver:', actualDriverId);
      ackPromise = getAcknowledgementByDriver(actualDriverId);
    } else if (isDriver && !actualDriverId) {
      console.warn('Driver logged in but no matching driver record found');
      setError('Your driver profile could not be found. Please logout and login again.');
      setLoading(false);
      return;
    } else {
      console.log('Loading all acknowledgements (dispatcher view)');
      ackPromise = getAllAcknowledgements();
    }
   
    ackPromise//the promise returned by the API call will resolve with the acknowledgement data, which we will then set in state. If there's an error during the API call, we will catch it and set an error message in state to inform the user.
      .then((data) => {
        console.log('Acknowledgements loaded:', {
          isDriver,
          actualDriverId,
          dataCount: data?.length,
          data,
        });
        setAcks(data || []);
      })
      .catch((err) => {
        console.error('Error loading acknowledgements:', err);
        const msg = isDriver
          ? 'Could not load your acknowledgements. Is DispatchService running?'
          : 'Could not load acknowledgements. Is DispatchService running?';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [isDriver, actualDriverId, user]);
 
  useEffect(() => {
    loadData();
    getAllDispatches().then(setDispatches).catch(() => {});
    // Load all drivers - both drivers and dispatchers need this
    getAllDrivers().then(setDrivers).catch(() => {});
  }, [loadData, isDriver, actualDriverId]);
 
  // ── Filtering ─────────────────────────────────────────────────────────────
  //search by dispatch ID, driver name, load code or notes
  const filtered = acks.filter((a) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const dispId = formatDispatchId(a.dispatch?.dispatch?.dispatchID).toLowerCase();
    const driverName = (a.driver?.name || '').toLowerCase();
    const loadCode = (a.dispatch?.load?.loadCode || '').toLowerCase();
    const notes = (a.notes || '').toLowerCase();
    return dispId.includes(q) || driverName.includes(q) || loadCode.includes(q) || notes.includes(q);
  });
 
  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);
 
  // ── Pagination ───────────────────────────────────────────────────────────
 
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
 
  // ── Stats ─────────────────────────────────────────────────────────────────
 
  // Show all dispatches that are not yet completed or cancelled
  const ACK_INELIGIBLE_STATUSES = ['COMPLETED', 'CANCELLED'];
  const eligibleDispatches = dispatches.filter(
    (d) => !ACK_INELIGIBLE_STATUSES.includes((d.dispatch || {}).status)
  );
 
  const stats = {//these stats will be displayed in the KPI cards at the top of the dashboard. They provide a quick overview of the total number of acknowledgements, how many were recorded today, how many unique drivers have acknowledged dispatches, and how many dispatches are currently eligible for acknowledgement.
    total:          acks.length,
    today:          acks.filter((a) => {
      if (!a.ackAt) return false;
      const d = new Date(a.ackAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
    unique:         new Set(acks.map((a) => a.driver?.driverID).filter(Boolean)).size,
    openDispatches: eligibleDispatches.length,
  };
 
  // ── Form handlers ─────────────────────────────────────────────────────────
 
  const openAdd = () => { 
    setEditingId(null);
    // For drivers: pre-fill their driver ID
    if (isDriver && actualDriverId) {
      setFormFields({
        dispatchID: '',
        driverID: String(actualDriverId),
        notes: ''
      });
    } else {
      setFormFields(EMPTY_FORM);
    }
    setFormErrors({});
    setFormApiError('');
    setSaving(false);
    setShowForm(true);
  };
 
  const openEdit = (ack) => {
    setEditingId(ack.ackID);
    setFormFields({
      dispatchID: String(ack.dispatch?.dispatch?.dispatchID || ''),
      driverID:   String(ack.driver?.driverID || ''),
      notes:      ack.notes || '',
    });
    setFormErrors({});
    setFormApiError('');
    setShowForm(true);
  };
 
  const openDetail = (ack) => {
    setSelectedAck(ack);
    setShowDetail(true);
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
   
    setFormFields((prev) => {
      const next = { ...prev, [name]: value };
      return next;
    });
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormApiError('');
    setFormSuccessMessage('');
    const validationErrors = validateForm(formFields);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }
 
    // Ensure both dispatch_id and driver_id are properly set for backend storage
    const payload = {
      dispatchID: Number(formFields.dispatchID),
      driverID:   Number(formFields.driverID),
      notes:      formFields.notes.trim() || null,
    };
 
    // Verify payload has required IDs before sending to backend
    if (!payload.dispatchID || !payload.driverID) {
      setFormApiError('Missing required dispatch or driver information.');
      return;
    }
 
    // Debug logging to help troubleshoot database constraint errors
    console.log('Acknowledgement Payload:', {//this log will show the exact payload being sent to the backend when creating or updating an acknowledgement. This is crucial for troubleshooting any database constraint errors, as it will allow us to verify that the dispatchID and driverID are correctly included in the payload.
      dispatchID: payload.dispatchID,
      driverID: payload.driverID,
      notes: payload.notes,
      actualDriverId: actualDriverId,
      isDriver: isDriver,
      userContext: { userId: user?.userId, role: user?.role, name: user?.name },
    });
 
    // Validate: Drivers can only create acknowledgements for themselves
    if (isDriver && payload.driverID !== actualDriverId) {
      setFormApiError('You can only create acknowledgements for yourself.');
      return;
    }
 
    setSaving(true);
    const apiCall = editingId
      ? updateAcknowledgement(editingId, payload)
      : createAcknowledgement(payload);
 
    apiCall
      .then(() => {
        const action = editingId ? 'updated' : 'added';
        setFormSuccessMessage(`Acknowledgement ${action} successfully!`);
        setTimeout(() => {
          setShowForm(false);
          setFormSuccessMessage('');
          setFormApiError('');
          loadData();
        }, 1500);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.response?.data || 'Save failed.';
        setFormApiError(String(msg));
      })
      .finally(() => setSaving(false));
  };
 
  const handleExport = () => {
    const headers = ['Ack ID', 'Driver', 'Dispatch ID', 'Load Code', 'Acknowledged At', 'Notes'];
    const rows = filtered.map((ack) => {
      const dispatch = ack.dispatch?.dispatch || {};
      const load = ack.dispatch?.load || {};
      return [
        `ACK${String(ack.ackID).padStart(4, '0')}`,
        ack.driver?.name || '–',
        formatDispatchId(dispatch.dispatchID),
        load.loadCode || '–',
        formatDateTime(ack.ackAt),
        ack.notes || '–',
      ];
    });
    exportCSV(`acknowledgements-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleDelete = async (ack) => {
    if (!window.confirm(`Are you sure you want to delete acknowledgement ${ack.ackID}?`)) {
      return;
    }
    try {
      await deleteAcknowledgement(ack.ackID);
      loadData();
    } catch (error) {
      console.error('Failed to delete acknowledgement:', error);
      alert('Failed to delete acknowledgement. Please try again.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <DashboardTemplate
        title={isDriver ? "My Acknowledgements" : "Driver Acknowledgements"}
        subtitle={isDriver
          ? `View and create your dispatches acknowledgements (Driver ID: ${actualDriverId || 'Loading...'})`
          : "Track driver acceptance of dispatch assignments (Dispatcher View)"}
        actionButtonLabel="+"
        onActionButtonClick={openAdd}
        kpiCards={[
          { label: 'TOTAL ACKNOWLEDGEMENTS', value: stats.total },
          { label: 'RECORDED TODAY', value: stats.today },
          { label: isDriver ? 'YOUR ACKNOWLEDGEMENTS' : 'UNIQUE DRIVERS', value: stats.unique },
          { label: 'DISPATCHES', value: stats.openDispatches },
        ]}
        contentCardTitle={isDriver ? "Your Acknowledgements" : "All Acknowledgements"}
        searchPlaceholder="Search by dispatch ID, driver name, load code or notes…"
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        filters={[]}
        exportButtonLabel={isDriver ? undefined : "Export"}
        onExport={isDriver ? undefined : handleExport}
        loading={loading}
        error={error}
      >
        <div className="table-wrapper">
          <table className="bookings-table ack-table">
            <thead>
              <tr>
                <th>Ack ID</th>
                <th>Driver</th>
                <th>Dispatch</th>
                <th>Acknowledged At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    {acks.length === 0
                      ? 'No acknowledgements recorded yet.'
                      : 'No results match your search.'}
                  </td>
                </tr>
              ) : (
                paginated.map((ack) => {
                  const dispatch = ack.dispatch?.dispatch || {};
                  const driver   = ack.driver || {};
                  return (
                    <tr
                      key={ack.ackID}
                      className="table-row ack-table-row"
                      onClick={() => navigate(`/acknowledgement/${ack.ackID}`)}
                    >
                      <td className="booking-id-cell">ACK{String(ack.ackID).padStart(4, '0')}</td>
                      <td>{driver.name || '–'}</td>
                      <td className="booking-id-cell">{formatDispatchId(dispatch.dispatchID)}</td>
                      <td>{formatDateTime(ack.ackAt)}</td>
                      <td className="actions-cell">
                        <div className="action-menu" onClick={(e) => e.stopPropagation()}>
                          <ActionMenuPortal
                            id={ack.ackID}
                            actions={[
                              { label: 'View', onClick: () => navigate(`/acknowledgement/${ack.ackID}`) },
                              { label: 'Edit', onClick: () => openEdit(ack) },
                              { label: 'Delete', onClick: () => handleDelete(ack), danger: true }
                            ]}
                          />
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
          />
        )}
      </DashboardTemplate>
 
      {/* ── Add / Edit Acknowledgement Slide-in Panel ── */}
      {showForm && (
        <div
          className="claim-form-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="claim-form-panel">
            <h2>{editingId ? 'Edit Acknowledgement' : '✔ Record Acknowledgement'}</h2>
 
            <form onSubmit={handleSubmit} noValidate className="form-section">
 
              <div className="form-field">
                <label>Dispatch <span className="required">*</span></label>
                <select
                  name="dispatchID"
                  value={formFields.dispatchID}
                  onChange={handleChange}
                  className={formErrors.dispatchID ? 'input-error' : ''}
                >
                  <option value="">— Select dispatch —</option>
                  {eligibleDispatches.map((d) => {
                    const dsp = d.dispatch || {};
                    const ld  = d.load     || {};
                    const st  = DISPATCH_STATUS_CONFIG[dsp.status] || { label: dsp.status };
                    return (
                      <option key={dsp.dispatchID} value={dsp.dispatchID}>
                        {formatDispatchId(dsp.dispatchID)}
                        {ld.loadCode ? ` · ${ld.loadCode}` : ''}
                        {` · ${st.label}`}
                      </option>
                    );
                  })}
                  {eligibleDispatches.length === 0 && (
                    <option disabled value="">No active dispatches available</option>
                  )}
                </select>
                {formErrors.dispatchID && <span className="error-msg">{formErrors.dispatchID}</span>}
              </div>
 
              <div className="form-field">
                <label>Driver <span className="required">*</span></label>
                <select
                  name="driverID"
                  value={formFields.driverID}
                  onChange={handleChange}
                  className={formErrors.driverID ? 'input-error' : ''}
                  disabled={isDriver}
                >
                  <option value="">— Select driver —</option>
                  {drivers.map((dr) => {
                    const drSt = DRIVER_STATUS_CONFIG[dr.status] || { label: dr.status };
                    return (
                      <option key={dr.driverID} value={dr.driverID}>
                        {dr.name} — {dr.licenseNo} ({drSt.label})
                      </option>
                    );
                  })}
                </select>
                {formErrors.driverID && <span className="error-msg">{formErrors.driverID}</span>}
                {isDriver && formFields.driverID && (
                  <span className="ack-lock-notice">✔ Your driver profile is locked for acknowledgements.</span>
                )}
              </div>
 
              <div className="form-field">
                <label>Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={300}
                  placeholder="Optional driver comments or remarks…"
                  value={formFields.notes}
                  onChange={handleChange}
                />
                <span className={`field-hint ack-char-count ${formFields.notes.length >= 280 ? 'warning' : ''}`}>
                  {formFields.notes.length}/300 characters
                </span>
              </div>
 
              {formSuccessMessage && (
                <div className="auth-message auth-message-success">✔ {formSuccessMessage}</div>
              )}
              {formApiError && (
                <div className="auth-message auth-message-error">⚠ {formApiError}</div>
              )}
 
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : '✔ Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      {/* ── Acknowledgement Detail View Panel ── */}
      {showDetail && selectedAck && (
        <div
          className="claim-form-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDetail(false); }}
        >
          <div className="claim-form-panel ack-detail-panel">
            <h2>Acknowledgement Details</h2>
 
            <div className="form-section">
              {/* Acknowledgement Info */}
              <div className="ack-detail-section">
                <h3 className="ack-section-title">
                  Acknowledgement Information
                </h3>
                <div className="ack-field-grid">
                  <div>
                    <label className="ack-field-label">
                      Acknowledgement ID
                    </label>
                    <p className="ack-field-value">
                      ACK{String(selectedAck.ackID).padStart(4, '0')}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      Acknowledged At
                    </label>
                    <p className="ack-field-value">
                      {formatDateTime(selectedAck.ackAt)}
                    </p>
                  </div>
                </div>
              </div>
 
              {/* Driver Details */}
              <div className="ack-detail-section">
                <h3 className="ack-section-title">
                  Driver Information
                </h3>
                <div className="ack-field-grid">
                  <div>
                    <label className="ack-field-label">
                      Driver Name
                    </label>
                    <p className="ack-field-value">
                      {selectedAck.driver?.name || '–'}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      Driver ID
                    </label>
                    <p className="ack-field-value">
                      {selectedAck.driver?.driverID || '–'}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      License No
                    </label>
                    <p className="ack-field-value">
                      {selectedAck.driver?.licenseNo || '–'}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      Mobile Number
                    </label>
                    <p className="ack-field-value">
                      {selectedAck.driver?.mobileNumber || selectedAck.driver?.phoneNumber || '–'}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      Status
                    </label>
                    <p className="ack-field-value">
                      {DRIVER_STATUS_CONFIG[selectedAck.driver?.status]?.label || selectedAck.driver?.status || '–'}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      Contact Info
                    </label>
                    <p className="ack-field-value">
                      {selectedAck.driver?.contactInfo || selectedAck.driver?.email || '–'}
                    </p>
                  </div>
                </div>
              </div>
 
              {/* Dispatch Details */}
              <div className="ack-detail-section">
                <h3 className="ack-section-title">
                  Dispatch Information
                </h3>
                <div className="ack-field-grid">
                  <div>
                    <label className="ack-field-label">
                      Dispatch ID
                    </label>
                    <p className="ack-field-value">
                      {formatDispatchId(selectedAck.dispatch?.dispatch?.dispatchID)}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      Status
                    </label>
                    <p className="ack-field-value">
                      {DISPATCH_STATUS_CONFIG[selectedAck.dispatch?.dispatch?.status]?.label || selectedAck.dispatch?.dispatch?.status || '–'}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      Assigned At
                    </label>
                    <p className="ack-field-value">
                      {formatDateTime(selectedAck.dispatch?.dispatch?.assignedAt || selectedAck.dispatch?.dispatch?.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      Assigned By
                    </label>
                    <p className="ack-field-value">
                      {selectedAck.dispatch?.dispatch?.assignedBy || '–'}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      Assigned Driver ID
                    </label>
                    <p className="ack-field-value">
                      {selectedAck.dispatch?.dispatch?.assignedDriverID || '–'}
                    </p>
                  </div>
                  <div>
                    <label className="ack-field-label">
                      Load ID
                    </label>
                    <p className="ack-field-value">
                      {selectedAck.dispatch?.dispatch?.loadID || '–'}
                    </p>
                  </div>
                </div>
              </div>
 
              {/* Load Details */}
              {selectedAck.dispatch?.load && (
                <div className="ack-detail-section">
                  <h3 className="ack-section-title">
                    Load Information
                  </h3>
                  <div className="ack-field-grid">
                    <div>
                      <label className="ack-field-label">
                        Load Code
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.load?.loadCode || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Status
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.load?.status || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Weight (kg)
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.load?.totalWeightKg || selectedAck.dispatch?.load?.weight || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Volume (m³)
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.load?.totalVolumeM3 || selectedAck.dispatch?.load?.volume || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Planned Start
                      </label>
                      <p className="ack-field-value">
                        {formatDateTime(selectedAck.dispatch?.load?.plannedStart || selectedAck.dispatch?.load?.pickupDate)}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Planned End
                      </label>
                      <p className="ack-field-value">
                        {formatDateTime(selectedAck.dispatch?.load?.plannedEnd || selectedAck.dispatch?.load?.deliveryDate)}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Load ID
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.load?.loadID || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Vehicle ID
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.load?.vehicleID || '–'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
 
              {/* Vehicle Details */}
              {selectedAck.dispatch?.vehicle && (
                <div className="ack-detail-section">
                  <h3 className="ack-section-title">
                    Vehicle Information
                  </h3>
                  <div className="ack-field-grid">
                    <div>
                      <label className="ack-field-label">
                        Vehicle Registration
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.vehicle?.regNumber || selectedAck.dispatch?.vehicle?.vehicleRegistration || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Vehicle Type
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.vehicle?.type || selectedAck.dispatch?.vehicle?.vehicleType || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Max Weight Capacity (kg)
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.vehicle?.maxWeightKg || selectedAck.dispatch?.vehicle?.capacity || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Max Volume Capacity (m³)
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.vehicle?.maxVolumeM3 || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Vehicle ID
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.vehicle?.vehicleID || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Status
                      </label>
                      <p className="ack-field-value">
                        {selectedAck.dispatch?.vehicle?.status || '–'}
                      </p>
                    </div>
                    <div>
                      <label className="ack-field-label">
                        Last Maintenance
                      </label>
                      <p className="ack-field-value">
                        {formatDateTime(selectedAck.dispatch?.vehicle?.lastMaintenanceAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
 
              {/* Notes */}
              {selectedAck.notes && (
                <div className="ack-detail-section">
                  <h3 className="ack-section-title">
                    Notes
                  </h3>
                  <div className="ack-notes-box">
                    {selectedAck.notes}
                  </div>
                </div>
              )}
 
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowDetail(false)}
                >
                  Close
                </button>
                {isDriver && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setShowDetail(false);
                      openEdit(selectedAck);
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
 
 