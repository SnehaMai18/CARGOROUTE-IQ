import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import DashboardTemplate from '../../components/DashboardTemplate';
import Pagination1 from '../../components/Pagination1';
import { exportCSV } from '../../utils/csvExport';
import useSort from '../../hooks/useSort';
import { deleteLoad, getAllLoads, getAllRoutes } from '../../api/routingApi';
import '../../styles/Routing.css';
 
export default function LoadPlanning() {
    const [activeMenu, setActiveMenu] = useState(null);
    const openUpRef = useRef({});
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const deliverySort = useSort('none');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();
 
  const normalizeLoad = useCallback((item) => {
    if (!item) return null;
 
    const raw = item?.load ? { ...item.load, vehicle: item.vehicle || null } : item;
 
    const loadID = raw.loadID ?? raw.id ?? raw.loadId;
    if (!loadID) return null;
 
// functions 

  


    return {
      ...raw,
      loadID,
      loadCode: raw.loadCode || `LOAD-${loadID}`,
      status: raw.status || 'PENDING',
      totalWeightKg: raw.totalWeightKg ?? 0,
      totalVolumeM3: raw.totalVolumeM3 ?? 0,
    };
  }, []);
 
  const deriveLoadsFromRoutes = useCallback(async () => {
    const routes = await getAllRoutes();
    const routeList = Array.isArray(routes) ? routes : (routes?.value || []);
    const byLoadId = new Map();
 
    routeList.forEach((route) => {
      const load = route?.load;
      if (!load) return;
 
      const normalized = normalizeLoad(load);
      if (normalized?.loadID && !byLoadId.has(normalized.loadID)) {
        byLoadId.set(normalized.loadID, normalized);
      }
    });
 
    return Array.from(byLoadId.values());
  }, [normalizeLoad]);
 
  // Fetch all loads
  const fetchLoads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllLoads();
      const normalizedLoads = (Array.isArray(data) ? data : [])
        .map(normalizeLoad)
        .filter(Boolean);
      setLoads(normalizedLoads);
    } catch (err) {
      try {
        const fallbackLoads = await deriveLoadsFromRoutes();
        setLoads(fallbackLoads);
        setError('Load API is temporarily unavailable. Showing loads from route data.');
      } catch (fallbackErr) {
        const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
        setError(apiMessage || 'Failed to load data. Please try again.');
        console.error('Load fetch failed:', err);
        console.error('Route fallback failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [deriveLoadsFromRoutes, normalizeLoad]);
 
  useEffect(() => {
    fetchLoads();
  }, [fetchLoads]);
 
  // Filter loads
  const filteredLoads = loads.filter((load) => {
    const matchesSearch =
      (load.loadCode && load.loadCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (load.loadID && load.loadID.toString().includes(searchTerm)) ||
      (load.totalWeightKg && load.totalWeightKg.toString().includes(searchTerm));
 
    const matchesStatus =
      filterStatus === 'all' ||
      (load.status && load.status.toLowerCase() === filterStatus.toLowerCase());
 
    return matchesSearch && matchesStatus;
  });
  const handleKebabToggle = (e, loadID) => {
    e.stopPropagation(); // Prevents the window click listener from closing it instantly
    if (activeMenu === loadID) {
      setActiveMenu(null);
      return;
    }
    
    // Calculate position immediately
    const rect = e.target.closest('.kebab-menu-wrapper').getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 50; // approximate height
    const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    
    openUpRef.current[loadID] = shouldOpenUp;
    setActiveMenu(loadID);
  };

  const handleAddLoad = () => navigate('/routing/load/new');
  const handleViewLoad = (id) => navigate(`/routing/load/${id}`);
  const handleEditLoad = (id) => navigate(`/routing/load/${id}/edit`);
  const handleDeleteLoad = async (id) => {
    if (!id) return;
    try {
      await deleteLoad(id);
      // Remove the deleted load from state instead of navigating
      setLoads(prev => prev.filter(load => load.loadID !== id));
      setActiveMenu(null); // Close the kebab menu
    } catch (err) {
      console.error('Error deleting load:', err);
      setError('Failed to delete load. Please try again.');
    }
  };

  const getSortTime = (value) => {
    if (!value) return Number.NaN;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? Number.NaN : time;
  };

  const getLoadId = (load) => {
    const id = load?.loadID ?? load?.id ?? load?.loadId;
    return Number(id) || 0;
  };
 
  const sortedLoads = [...filteredLoads].sort((a, b) => {
    const aValue = getSortTime(a.plannedEnd);
    const bValue = getSortTime(b.plannedEnd);
    const aMissing = Number.isNaN(aValue);
    const bMissing = Number.isNaN(bValue);
    if (aMissing && bMissing) {
      return getLoadId(b) - getLoadId(a);
    }
    if (aMissing) return 1;
    if (bMissing) return -1;

    if (deliverySort.direction === 'asc') return aValue - bValue;
    if (deliverySort.direction === 'desc') return bValue - aValue;

    return getLoadId(b) - getLoadId(a);
  });
 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, deliverySort.direction, loads]);
 
  const totalPages = Math.max(1, Math.ceil(sortedLoads.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLoads = sortedLoads.slice(startIndex, endIndex);
 
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
 
  // Calculate statistics
  const stats = {
    total: loads.length,
    planned: loads.filter((l) => (l.status || '').toUpperCase() === 'PLANNED').length,
    inTransit: loads.filter((l) => {
      const s = (l.status || '').toUpperCase();
      return s === 'IN_TRANSIT' || s === 'IN TRANSIT' || s === 'INTRANSIT';
    }).length,
    delivered: loads.filter((l) => (l.status || '').toUpperCase() === 'DELIVERED').length,
  };
 
  // Get status color
  const getStatusColor = (status) => {
    if (!status) return 'status-pending';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'planned') return 'status-optimized';
    if (lowerStatus === 'delivered') return 'status-completed';
    return 'status-pending';
  };
 
  const exportLoads = () => {
    const headers = ['Load Code', 'Load ID', 'Weight (kg)', 'Volume (m³)', 'Status', 'Pickup', 'Delivery'];
    const rows = sortedLoads.map((load) => [
      load.loadCode || `LOAD-${load.loadID}`,
      load.loadID || '',
      load.totalWeightKg ?? 0,
      load.totalVolumeM3 ?? 0,
      load.status || 'Pending',
      load.plannedStart ? new Date(load.plannedStart).toLocaleDateString() : '-',
      load.plannedEnd ? new Date(load.plannedEnd).toLocaleDateString() : '-',
    ]);
    exportCSV('loads.csv', headers, rows);
  };
 
  if (loading) {
    return (
      <Layout>
        <div className="routing-container">
          <div className="loading-spinner">Loading loads...</div>
        </div>
      </Layout>
    );
  }
 
  return (
    <Layout>
      {error && (
        <div className="alert alert-error">
          <span>⚠</span> {error}
        </div>
      )}
      <DashboardTemplate
        title="Load Planning"
        subtitle="Consolidate bookings into optimized loads"
        contentCardTitle="All Loads"
        actionButtonLabel="+"
        onActionButtonClick={handleAddLoad}
        kpiCards={[
          { label: 'Total Loads', value: stats.total },
          { label: 'Planned', value: stats.planned },
          { label: 'Delivered', value: stats.delivered },
          { label: 'In Transit', value: stats.inTransit }
        ]}
        searchPlaceholder="Search by Load Code, ID or Weight..."
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filters={[
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            value: filterStatus,
            onChange: (e) => setFilterStatus(e.target.value),
            options: [
              { value: 'all', label: 'Status' },
              { value: 'planned', label: 'Planned' },
              { value: 'in_transit', label: 'In Transit' },
              { value: 'delivered', label: 'Delivered' }
            ]
          }
        ]}
        exportButtonLabel="Export"
        onExport={exportLoads}
      >
        <div className="table-container">
          <table className="routes-table">
            <thead>
              <tr>
                <th>Load ID</th>
                <th>Weight (kg)</th>
                <th>Volume (m³)</th>
                <th>Status</th>
                <th>Pickup</th>
                <th>
                  <button type="button" className="sortable-header" tabIndex={-1} onClick={(e) => { e.preventDefault(); e.stopPropagation(); deliverySort.toggle(); e.currentTarget.blur(); }}>
                    Delivery
                    <span className={`sort-arrow ${deliverySort.direction !== 'none' ? 'active' : ''}`}>{deliverySort.icon}</span>
                  </button>
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoads.length > 0 ? (
                paginatedLoads.map((load) => (
                  <tr key={load.loadID} className="load-row">
                    <td className="font-medium">{load.loadCode || `LOAD-${load.loadID}`}</td>
                    <td>{load.totalWeightKg || 0}</td>
                    <td>{load.totalVolumeM3 ? Number(load.totalVolumeM3).toFixed(2) : 0}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(load.status)}`}>
                        {load.status || 'Pending'}
                      </span>
                    </td>
                    <td>{load.plannedStart ? new Date(load.plannedStart).toLocaleDateString() : '-'}</td>
                    <td>{load.plannedEnd ? new Date(load.plannedEnd).toLocaleDateString() : '-'}</td>
                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="kebab-menu-wrapper">
                        <button 
                          className={`kebab-trigger ${activeMenu === load.loadID ? 'active' : ''}`}
                          onClick={(e) => handleKebabToggle(e, load.loadID )}
                        >
                          &#8943; {/* Vertical dots symbol */}
                        </button>
                        
                        {activeMenu === load.loadID && (
                          <div className={`kebab-dropdown-card ${openUpRef.current[load.loadID] ? 'open-up' : ''}`}>
                            <button onClick={() => handleViewLoad(load.loadID )}>View</button>
                            <button onClick={() => handleEditLoad(load.loadID )}>Edit</button>
                            <button className="delete-item" onClick={(e) => { e.stopPropagation(); handleDeleteLoad(load.loadID); }}>Delete</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No loads found. Click "Create Load" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredLoads.length > 0 && (
          <Pagination1
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            infoText={`Showing ${startIndex + 1}-${Math.min(endIndex, sortedLoads.length)} of ${sortedLoads.length}`}
          />
        )}
      </DashboardTemplate>
    </Layout>
  );
}
 