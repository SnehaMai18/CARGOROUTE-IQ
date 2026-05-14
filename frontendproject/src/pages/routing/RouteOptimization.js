import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import DashboardTemplate from '../../components/DashboardTemplate';
import Pagination1 from '../../components/Pagination1';
import { getAllRoutes, deleteRoute } from '../../api/routingApi';
import '../styles/Routing.css';

export default function RouteOptimization() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);
  const [openUp, setOpenUp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();

  const normalizeStatus = (status) => {
    const s = (status || '').toString().trim().toLowerCase().replace(/\s+/g, '_');
    if (s === 'planned') return 'planned';
    if (s === 'in_progress') return 'in_progress';
    if (s === 'completed') return 'completed';
    return 'unknown';
  };

  // Fetch all routes
  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllRoutes();
      const normalizedRoutes = (Array.isArray(data) ? data : []).map((route) => ({
        id: route.routeID,
        routeId: route.routeID,
        loadId: route.load?.loadID,
        loadCode: route.load?.loadCode,
        vehicleId: route.load?.vehicleID,
        status: route.status,
        totalDistance: route.distanceKm,
        estimatedDuration: route.estimatedDurationMin,
      }));
      setRoutes(normalizedRoutes);
    } catch (err) {
      setError('Failed to load routes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Filter routes based on search and status
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.routeId?.toString().includes(searchTerm) ||
      route.loadCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.vehicleId?.toString().includes(searchTerm) ||
      route.loadId?.toString().includes(searchTerm);

    const matchesStatus =
      filterStatus === 'all' || normalizeStatus(route.status) === filterStatus;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, routes]);

  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRoutes = filteredRoutes.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleViewRoute = (routeId) => {
    navigate(`/routing/route/${routeId}`);
  };

  const handleEditRoute = (routeId) => {
    navigate(`/routing/route/${routeId}/edit`);
  };

  const handleDeleteRoute = async (routeId) => {
    if (!routeId) return;
    try {
      await deleteRoute(routeId);
      // Remove the deleted route from state instead of navigating
      setRoutes(prev => prev.filter(route => route.id !== routeId));
      setActiveMenu(null); // Close the kebab menu
    } catch (err) {
      console.error('Error deleting route:', err);
      setError('Failed to delete route. Please try again.');
    }
  };

  const handleKebabToggle = (e, routeId) => {
    e.stopPropagation();
    const rect = e.target.closest('.kebab-menu-wrapper').getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 50; // approximate height
    const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    setOpenUp(shouldOpenUp);
    setActiveMenu(activeMenu === routeId ? null : routeId);
  };

  // Calculate route statistics
  const stats = {
    total: routes.length,
    planned: routes.filter((r) => normalizeStatus(r.status) === 'planned').length,
    inProgress: routes.filter((r) => normalizeStatus(r.status) === 'in_progress').length,
    completed: routes.filter((r) => normalizeStatus(r.status) === 'completed').length,
    avgDistance:
      routes.length > 0
        ? (
            routes.reduce((sum, r) => sum + (r.totalDistance || 0), 0) / routes.length
          ).toFixed(2)
        : 0,
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'in_progress') return 'status-optimized';
    if (normalized === 'completed') return 'status-completed';
    return 'status-pending';
  };

  const downloadTextFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const exportRoutes = (format) => {
    const fileDate = new Date().toISOString().slice(0, 10);
    const headers = ['Route ID', 'Load', 'Vehicle ID', 'Status', 'Distance (km)', 'Duration'];

    const rows = filteredRoutes.map((route) => [
      route.routeId || 'N/A',
      route.loadCode || route.loadId || '-',
      route.vehicleId || '-',
      route.status || 'Pending',
      route.totalDistance ? route.totalDistance.toFixed(2) : '-',
      route.estimatedDuration || '-',
    ]);

    if (format === 'excel') {
      const tsv = [
        headers.join('\t'),
        ...rows.map((row) => row.map((cell) => String(cell ?? '').replace(/\t/g, ' ')).join('\t')),
      ].join('\n');

      downloadTextFile(`\ufeff${tsv}`, `routes-${fileDate}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
      return;
    }

    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n');

    downloadTextFile(`\ufeff${csv}`, `routes-${fileDate}.csv`, 'text/csv;charset=utf-8;');
  };

  if (loading) {
    return (
      <Layout>
        <div className="routing-container">
          <div className="loading-spinner">Loading routes...</div>
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
        title="Route Optimization"
        subtitle="Review and approve optimized delivery routes"
        contentCardTitle="All Routes"
        actionButtonLabel="+"
        onActionButtonClick={() => navigate('/routing/routes/new')}
        kpiCards={[
          { label: 'Total Routes', value: stats.total },
          { label: 'Planned', value: stats.planned },
          { label: 'In Progress', value: stats.inProgress },
          { label: 'Completed', value: stats.completed }
        ]}
        searchPlaceholder="Search by Route ID, Vehicle ID, or Load ID..."
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
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' }
            ]
          }
        ]}
        exportOptions={[
          { label: 'Export CSV', onClick: () => exportRoutes('csv') }
        ]}
      >
        <div className="table-container">
          <table className="routes-table">
            <thead>
              <tr>
                <th>Route Id</th>
                <th>Load</th>
                <th>Vehicle Id</th>
                <th>Status</th>
                <th>Distance (km)</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.length > 0 ? (
                paginatedRoutes.map((route) => (
                  <tr key={route.id} className="route-row">
                    <td className="font-medium">{route.routeId || 'N/A'}</td>
                    <td>{route.loadCode || route.loadId || '-'}</td>
                    <td>{route.vehicleId || '-'}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(route.status)}`}>
                        {route.status || 'Pending'}
                      </span>
                    </td>
                    <td>{route.totalDistance ? route.totalDistance.toFixed(2) : '-'}</td>
                    <td>{route.estimatedDuration || '-'}</td>
                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="kebab-menu-wrapper">
                        <button
                          className={`kebab-trigger ${activeMenu === route.id ? 'active' : ''}`}
                          onClick={(e) => handleKebabToggle(e, route.id)}
                          aria-label="Open actions menu"
                        >
                          &#8943;
                        </button>

                        {activeMenu === route.id && (
                          <div className={`kebab-dropdown-card ${openUp ? 'open-up' : ''}`}>
                            <button onClick={() => handleViewRoute(route.id)}>View</button>
                            <button onClick={() => handleEditRoute(route.id)}>Edit</button>
                            <button className="delete-item" onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id); }}>Delete</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No routes found. Click "Add Route" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredRoutes.length > 0 && (
          <Pagination1
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            infoText={`Showing ${startIndex + 1}-${Math.min(endIndex, filteredRoutes.length)} of ${filteredRoutes.length}`}
          />
        )}
      </DashboardTemplate>
    </Layout>
  );
}
