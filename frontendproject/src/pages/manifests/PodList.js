import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import Layout from '../../components/Layout';
import DashboardTemplate from '../../components/DashboardTemplate';
import Pagination from '../../components/Pagination';
import {
  getAllPods,
  getPodsByDriver,
  deletePod,
} from '../../api/manifestApi';
import { getAllDrivers, getDriverById } from '../../api/dispatchApi';
import { getBookingById } from '../../api/bookingsApi';
import { POD_STATUS_CONFIG, POD_TYPE_CONFIG, siteName } from '../../utils/constants';
import '../../styles/Bookings.css';
import '../../styles/DispatchManifests.css';
import '../../styles/PodList.css';
 
function formatPodId(id)     { return `POD${String(id).padStart(4, '0')}`; }
function formatBookingId(id) { return id ? `BK${String(id).padStart(4, '0')}` : '–'; }
function formatDateTime(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
 
const PAGE_SIZE = 4;
 
export default function PodList() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
 
  // Check if current user is a Driver
  const isDriver = user?.role?.toLowerCase() === 'driver';
  const userId = user?.userId;

  const [pods, setPods]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter]     = useState('ALL');
  const [currentPage, setCurrentPage]   = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [actualDriverId, setActualDriverId] = useState(null);

  // Pod Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalData, setDetailModalData] = useState(null);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [fullImageModal, setFullImageModal] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState('');
  const [driverData, setDriverData] = useState(null);

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
 
  const loadPods = useCallback(() => {
    setLoading(true);
    
    // Load PODs based on role
    let podPromise;
    if (isDriver && actualDriverId) {
      console.log('Loading PODs for driver:', actualDriverId);
      podPromise = getPodsByDriver(actualDriverId);
    } else if (isDriver && !actualDriverId) {
      console.log('Driver ID not yet resolved, will load when available');
      setLoading(false);
      setPods([]);
      return;
    } else {
      console.log('Loading all PODs (dispatcher/manager view)');
      podPromise = getAllPods();
    }
    
    podPromise
      .then(setPods)
      .catch((err) => {
        console.error('Error loading PODs:', err);
        setPods([]);
      })
      .finally(() => setLoading(false));
  }, [isDriver, actualDriverId]);
 
  useEffect(() => { loadPods(); }, [loadPods]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, typeFilter]);
 
  const filtered = pods.filter((p) => {
    const pod  = p.proofOfDelivery || {};
    const bk   = p.booking        || {};
    const q    = search.toLowerCase().trim();
    const matchSearch = !q ||
      formatPodId(pod.podID).toLowerCase().includes(q) ||
      formatBookingId(pod.bookingID).toLowerCase().includes(q) ||
      (pod.receivedBy || '').toLowerCase().includes(q) ||
      (bk.commodity   || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || pod.status === statusFilter;
    const matchType   = typeFilter   === 'ALL' || pod.podType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });
 
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
 
  const stats = {
    total:    pods.length,
    pending:  pods.filter((p) => p.proofOfDelivery?.status === 'PENDING').length,
    verified: pods.filter((p) => p.proofOfDelivery?.status === 'VERIFIED').length,
    rejected: pods.filter((p) => p.proofOfDelivery?.status === 'REJECTED').length,
  };
 
  const handleDelete = (id) => {
    if (!window.confirm('Delete this POD? This cannot be undone.')) return;
    deletePod(id)
      .then(() => { setOpenMenuId(null); loadPods(); })
      .catch(() => setOpenMenuId(null));
  };

  // ── Permission helpers ────────────────────────────────────────────────────
  const userRole = user?.role?.toLowerCase() || '';
  const isAdmin = userRole === 'admin';
  const canEditPod = (pod) => {
    // Drivers can only edit their own PODs, Admins can edit all
    if (isDriver) {
      return pod.driverId === actualDriverId;
    }
    // Admins and managers can edit PODs
    return ['admin', 'dispatcher', 'warehousemanager', 'analyst'].includes(userRole);
  };
  
  const canDeletePod = (pod) => {
    // Drivers can only delete their own PODs, Admins can delete all
    if (isDriver) {
      return pod.driverId === actualDriverId;
    }
    // Admins and managers can delete PODs
    return ['admin', 'dispatcher', 'warehousemanager'].includes(userRole);
  };

  const handleViewPodDetails = async (podItem) => {
    try {
      setDetailModalLoading(true);
      
      const pod = podItem.proofOfDelivery || {};
      const bookingId = pod.bookingID;
      
      let booking = podItem.booking || null;
      
      // If booking not embedded, fetch separately
      if (!booking && bookingId) {
        try {
          const response = await getBookingById(bookingId);
          booking = response.data || response;
        } catch (err) {
          console.error('Failed to fetch booking details:', err);
          booking = {};
        }
      }

      // Fetch driver details
      let driver = null;
      if (pod.driverId) {
        try {
          driver = await getDriverById(pod.driverId);
        } catch (err) {
          console.error('Failed to fetch driver details:', err);
          driver = {};
        }
      }
      
      setDetailModalData({
        pod,
        booking: booking || {},
      });
      setDriverData(driver || {});
      
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading POD details:', error);
      alert('Failed to load POD details');
    } finally {
      setDetailModalLoading(false);
    }
  };
 
  const handleExport = () => {
    const headers = ['POD ID', 'Booking ID', 'Received By', 'Type', 'Status', 'Delivered At'];
    const rows = filtered.map((p) => {
      const pod = p.proofOfDelivery || {};
      return [
        formatPodId(pod.podID),
        formatBookingId(pod.bookingID),
        pod.receivedBy || '–',
        pod.podType || '–',
        pod.status || '–',
        formatDateTime(pod.deliveredAt),
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pods.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
 
  return (
    <Layout>
      <DashboardTemplate
        title={isDriver ? "My Proofs of Delivery" : "All Proofs of Delivery"}
        subtitle={isDriver ? "View and manage your submitted delivery proofs" : "Manage and verify all delivery documentation"}
        actionButtonLabel={isDriver ? "+" : ""}
        onActionButtonClick={() => isDriver && navigate('/pod/new')}
        kpiCards={[
          { label: 'TOTAL PODS', value: stats.total },
          { label: 'PENDING', value: stats.pending },
          { label: 'VERIFIED', value: stats.verified },
          { label: 'REJECTED', value: stats.rejected },
        ]}
        contentCardTitle={isDriver ? "My Submitted PODs" : "All PODs"}
        searchPlaceholder="Search by POD ID, booking ID, or receiver name..."
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Status', value: 'ALL' },
              ...Object.entries(POD_STATUS_CONFIG).map(([k, v]) => ({ label: v.label, value: k })),
            ],
            onChange: (e) => setStatusFilter(e.target.value),
          },
          {
            label: 'Type',
            value: typeFilter,
            options: [
              { label: 'All Types', value: 'ALL' },
              ...Object.entries(POD_TYPE_CONFIG).map(([k, v]) => ({ label: v.label, value: k })),
            ],
            onChange: (e) => setTypeFilter(e.target.value),
          },
        ]}
        exportButtonLabel="Export"
        onExport={handleExport}
        loading={loading}
        error={null}
      >
        {/* Table */}
        {!loading && (
          <div>
            <table className="pod-list-table">
              <thead>
                <tr className="pod-list-table-header">
                  <th className="pod-list-table-header-cell">POD ID</th>
                  <th className="pod-list-table-header-cell">Booking ID</th>
                  <th className="pod-list-table-header-cell">Received By</th>
                  <th className="pod-list-table-header-cell">Type</th>
                  <th className="pod-list-table-header-cell">Status</th>
                  <th className="pod-list-table-header-cell" style={{ width: '60px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="pod-list-table-empty">
                      {pods.length === 0 
                        ? (isDriver ? 'You have not submitted any PODs yet. Create your first one.' : 'No PODs available yet.') 
                        : 'No PODs match your search.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((p) => {
                    const pod = p.proofOfDelivery || {};
                    const st = POD_STATUS_CONFIG[pod.status] || { label: pod.status };
                    const pt = POD_TYPE_CONFIG[pod.podType] || { label: pod.podType };
                    const canEdit = canEditPod(pod);
                    const canDelete = canDeletePod(pod);
                    return (
                      <tr key={pod.podID} className="pod-list-table-row" onClick={() => navigate(`/pods/${pod.podID}`)}>
                        <td className="pod-list-table-cell">{formatPodId(pod.podID)}</td>
                        <td className="pod-list-table-cell">{formatBookingId(pod.bookingID)}</td>
                        <td className="pod-list-table-cell">{pod.receivedBy || '–'}</td>
                        <td className="pod-list-table-cell">{pt.label}</td>
                        <td className="pod-list-table-cell">
                          <span className="pod-list-status-badge">{st.label}</span>
                        </td>
                        <td className="pod-list-action-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="pod-list-action-container">
                            <button
                              className="pod-list-menu-button"
                              aria-label="Actions"
                              onClick={() => setOpenMenuId(openMenuId === pod.podID ? null : pod.podID)}
                            >
                              ⋯
                            </button>
                            {openMenuId === pod.podID && (
                              <div className="pod-list-dropdown-menu">
                                <button onClick={() => { setOpenMenuId(null); handleViewPodDetails(p); }} className="pod-list-dropdown-item">
                                  View
                                </button>
                                {canDelete && (
                                  <button onClick={() => { setOpenMenuId(null); handleDelete(pod.podID); }} className="pod-list-dropdown-item delete">
                                    Delete
                                  </button>
                                )}
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
 
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
        {/* POD Detail Modal */}
        {showDetailModal && detailModalData && (
          <div className="pod-list-modal-overlay">
            <div className="pod-list-modal-content">
              {/* Modal Header */}
              <div className="pod-list-modal-header">
                <div>
                  <h2 className="pod-list-modal-title">{formatPodId(detailModalData.pod.podID)}</h2>
                  <p className="pod-list-modal-subtitle">Proof of Delivery — Detail View</p>
                </div>
                <div className="pod-list-modal-header-actions">
                  <span className="pod-list-modal-status">
                    {detailModalData.pod.status || 'UNKNOWN'}
                  </span>
                  <button onClick={() => setShowDetailModal(false)} className="pod-list-modal-close">×</button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="pod-list-modal-body">
                {detailModalLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', fontSize: '14px', color: '#6b7280' }}>Loading details...</div>
                ) : (
                  <>
                    {/* POD Information Section */}
                    <div className="pod-list-modal-section">
                      <h3 className="pod-list-modal-section-title">📄 Proof of Delivery Information</h3>
                      <div className="pod-list-modal-grid">
                        <div>
                          <div className="pod-list-modal-label">POD ID</div>
                          <div className="pod-list-modal-value-large">{formatPodId(detailModalData.pod.podID)}</div>
                        </div>
                        <div>
                          <div className="pod-list-modal-label">Verification Status</div>
                          <span className="pod-list-modal-status">
                            {detailModalData.pod.status || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>
                      <div className="pod-list-modal-grid">
                        <div>
                          <div className="pod-list-modal-label">POD Type</div>
                          <div className="pod-list-modal-value">{detailModalData.pod.podType || '–'}</div>
                        </div>
                        <div>
                          <div className="pod-list-modal-label">Received By</div>
                          <div className="pod-list-modal-value">{detailModalData.pod.receivedBy || '–'}</div>
                        </div>
                      </div>
                      <div className="pod-list-modal-grid pod-list-modal-single-col">
                        <div>
                          <div className="pod-list-modal-label">Delivery Date & Time</div>
                          <div className="pod-list-modal-value">{formatDateTime(detailModalData.pod.deliveredAt)}</div>
                        </div>
                      </div>

                      {/* POD Image Section */}
                      {detailModalData.pod.podURI && (
                        <div className="pod-list-modal-image-section">
                          <div className="pod-list-modal-label">POD Document</div>
                          <div className="pod-list-modal-image-container">
                            <img 
                              src={detailModalData.pod.podURI.startsWith('/') ? `http://localhost:8001${detailModalData.pod.podURI}` : detailModalData.pod.podURI}
                              alt="POD" 
                              className="pod-list-modal-image"
                              onError={(e) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/%3E%3C/svg%3E'}
                            />
                            <button 
                              onClick={() => { 
                                setFullImageUrl(detailModalData.pod.podURI.startsWith('/') ? `http://localhost:8001${detailModalData.pod.podURI}` : detailModalData.pod.podURI); 
                                setFullImageModal(true); 
                              }} 
                              className="pod-list-modal-image-button"
                            >
                              View Full Image
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Driver Information Section */}
                    {driverData && Object.keys(driverData).length > 0 && (
                      <div className="pod-list-modal-section">
                        <h3 className="pod-list-modal-section-title">👤 Driver Information</h3>
                        <div className="pod-list-modal-grid">
                          <div>
                            <div className="pod-list-modal-label">Driver Name</div>
                            <div className="pod-list-modal-value-large">{driverData?.name || '–'}</div>
                          </div>
                          <div>
                            <div className="pod-list-modal-label">Driver ID</div>
                            <div className="pod-list-modal-value">{driverData?.driverID || detailModalData.pod?.driverId || '–'}</div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Booking Information Section */}
                    {detailModalData.booking && Object.keys(detailModalData.booking).length > 0 && (
                      <div className="pod-list-modal-section">
                        <h3 className="pod-list-modal-section-title">📦 Associated Booking Details</h3>
                        <div className="pod-list-modal-grid">
                          <div>
                            <div className="pod-list-modal-label">Booking ID</div>
                            <div className="pod-list-modal-value-large">{formatBookingId(detailModalData.booking.bookingID)}</div>
                          </div>
                          {detailModalData.booking.status && (
                            <div>
                              <div className="pod-list-modal-label">Booking Status</div>
                              <div className="pod-list-modal-value">{detailModalData.booking.status}</div>
                            </div>
                          )}
                        </div>
                        <div className="pod-list-modal-grid">
                          <div>
                            <div className="pod-list-modal-label">Commodity</div>
                            <div className="pod-list-modal-value">{detailModalData.booking.commodity || '–'}</div>
                          </div>
                        </div>
                        <div className="pod-list-modal-grid">
                          <div>
                            <div className="pod-list-modal-label">Origin</div>
                            <div className="pod-list-modal-value">{detailModalData.booking.originSiteID ? siteName(Number(detailModalData.booking.originSiteID)) : (detailModalData.booking.origin || '–')}</div>
                          </div>
                          <div>
                            <div className="pod-list-modal-label">Destination</div>
                            <div className="pod-list-modal-value">{detailModalData.booking.destinationSiteID ? siteName(Number(detailModalData.booking.destinationSiteID)) : (detailModalData.booking.destination || '–')}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pod-list-modal-footer">
                <button onClick={() => setShowDetailModal(false)} className="pod-list-modal-close-button">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Full Image Modal */}
        {fullImageModal && fullImageUrl && (
          <div className="pod-list-full-image-overlay">
            <div className="pod-list-full-image-container">
              <button onClick={() => setFullImageModal(false)} className="pod-list-full-image-close">×</button>
              <img src={fullImageUrl} alt="Full POD" className="pod-list-full-image" onError={(e) => e.target.textContent = 'Image failed to load'} />
            </div>
          </div>
        )}      </DashboardTemplate>
    </Layout>
  );
}
 
 