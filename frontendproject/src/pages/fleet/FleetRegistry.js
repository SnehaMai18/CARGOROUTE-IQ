import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import DashboardTemplate from '../../components/DashboardTemplate';
import { getAllVehicles, deleteVehicle } from '../../api/fleetApi';
import { exportCSV } from '../../utils/csvExport';
import useSort from '../../hooks/useSort';
import Pagination1 from '../../components/Pagination1';
import '../../styles/Fleet.css';

export default function FleetRegistry() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const maintenanceSort = useSort('none');
  
  // New state to track which kebab menu is open
  const [activeMenu, setActiveMenu] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    unavailable: 0,
    inUse: 0,
    maintenance: 0,
  });

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllVehicles();
      setVehicles(data);
      calculateStats(data);
      setFilteredVehicles(data);
      setError(null);
    } catch (err) {
      setError('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Global listener to close the kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      const filtered = vehicles.filter((vehicle) => {
        const matchesSearch =
          vehicle.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (vehicle.driver?.name && vehicle.driver.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
          filterStatus === 'all' ||
          (vehicle.status && vehicle.status.toLowerCase() === filterStatus.toLowerCase());

        return matchesSearch && matchesStatus;
      });
      setFilteredVehicles(filtered);
      setCurrentPage(1);
    } else {
      setFilteredVehicles([]);
      setCurrentPage(1);
    }
  }, [searchTerm, filterStatus, vehicles]);

  const getVehicleId = (vehicle) => Number(vehicle?.vehicleID ?? vehicle?.id ?? vehicle?.vehicleId) || 0;

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    const aTime = a?.lastMaintenanceAt ? new Date(a.lastMaintenanceAt).getTime() : Number.NaN;
    const bTime = b?.lastMaintenanceAt ? new Date(b.lastMaintenanceAt).getTime() : Number.NaN;

    const aMissing = Number.isNaN(aTime);
    const bMissing = Number.isNaN(bTime);
    if (aMissing && bMissing) {
      return getVehicleId(b) - getVehicleId(a);
    }
    if (aMissing) return 1;
    if (bMissing) return -1;

    if (maintenanceSort.direction === 'asc') return aTime - bTime;
    if (maintenanceSort.direction === 'desc') return bTime - aTime;

    return getVehicleId(b) - getVehicleId(a);
  });

  const totalPages = Math.max(1, Math.ceil(sortedVehicles.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = sortedVehicles.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const calculateStats = (vehicleList) => {
    const stats = {
      total: vehicleList.length,
      unavailable: vehicleList.filter(v => v.status?.toUpperCase() === 'UNAVAILABLE').length,
      inUse: vehicleList.filter(v => v.status?.toUpperCase() === 'ACTIVE').length,
      maintenance: vehicleList.filter(v => v.status?.toUpperCase() === 'MAINTENANCE').length,
    };
    setStats(stats);
  };

  const handleKebabToggle = (e, vehicleID) => {
    e.stopPropagation(); // Prevents the window click listener from closing it instantly
    setActiveMenu(activeMenu === vehicleID ? null : vehicleID);
  };

  const handleAddVehicle = () => navigate('/fleet/vehicles/new');

  const handleExport = () => {
    const headers = ['Registration', 'Type', 'Capacity (kg)', 'Volume (m³)', 'Assigned Driver', 'Last Maintenance', 'Status'];
    const rows = sortedVehicles.map((vehicle) => [
      vehicle.regNumber,
      vehicle.type,
      vehicle.maxWeightKg || 0,
      vehicle.maxVolumeM3 || 0,
      vehicle.driver?.name || 'Unassigned',
      formatDate(vehicle.lastMaintenanceAt),
      vehicle.status || 'Unknown',
    ]);
    exportCSV('fleet-registry.csv', headers, rows);
  };
  const handleViewVehicle = (id) => navigate(`/fleet/vehicles/${id}`);
  const handleEditVehicle = (id) => navigate(`/fleet/vehicles/${id}/edit`);
  const handleDeleteVehicle = async (id) => {
    if (!id) return;
    try {
      await deleteVehicle(id);
      // Remove the deleted vehicle from state instead of navigating
      setVehicles(prev => prev.filter(vehicle => vehicle.vehicleID !== id));
      setFilteredVehicles(prev => prev.filter(vehicle => vehicle.vehicleID !== id));
      setActiveMenu(null); // Close the kebab menu
    } catch (err) {
      setError('Failed to delete vehicle');
    }
  };

  const getStatusBadgeClass = (status) => {
    const upperStatus = status?.toUpperCase() || 'UNKNOWN';
    if (upperStatus === 'ACTIVE') return 'status-available';
    if (upperStatus === 'UNAVAILABLE') return 'status-unavailable';
    if (upperStatus === 'MAINTENANCE') return 'status-maintenance';
    return 'status-unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <DashboardTemplate
        title="Fleet Registry"
        subtitle="Manage vehicles, capacity, and availability"
        contentCardTitle="All Vehicles"
        actionButtonLabel="+"
        onActionButtonClick={handleAddVehicle}
        kpiCards={[
          { label: 'Total Vehicles', value: stats.total },
          { label: 'Active', value: stats.inUse },
          { label: 'Unavailable', value: stats.unavailable },
          { label: 'Maintenance', value: stats.maintenance },
        ]}
        searchPlaceholder="Search vehicle by Registration, Type, or Driver"
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filters={[
          {
            label: 'Status',
            value: filterStatus,
            options: [
              { label: 'Status', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Unavailable', value: 'unavailable' },
              { label: 'Maintenance', value: 'maintenance' },
            ],
            onChange: (e) => setFilterStatus(e.target.value),
          },
        ]}
        exportButtonLabel="Export"
        onExport={handleExport}
        loading={loading}
        error={error}
      >
        <div className="table-container">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Assigned Driver</th>
                <th>
                  <button type="button" className="sortable-header" tabIndex={-1} onClick={(e) => { e.preventDefault(); e.stopPropagation(); maintenanceSort.toggle(); e.currentTarget.blur(); }}>
                    Last Maintenance
                    <span className={`sort-arrow ${maintenanceSort.direction !== 'none' ? 'active' : ''}`}>{maintenanceSort.icon}</span>
                  </button>
                </th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.map((vehicle) => (
                <tr key={vehicle.vehicleID} className="vehicle-row">
                  <td className="reg-number">{vehicle.regNumber}</td>
                  <td>{vehicle.type}</td>
                  <td className="capacity">
                    {vehicle.maxWeightKg?.toLocaleString()} kg<br />
                    <small>{vehicle.maxVolumeM3} m³</small>
                  </td>
                  <td>{vehicle.driver?.name || 'Unassigned'}</td>
                  <td>{formatDate(vehicle.lastMaintenanceAt)}</td>
                  <td className="status-column">
                    <span className={`status-badge ${getStatusBadgeClass(vehicle.status)}`}>
                      {vehicle.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="kebab-menu-wrapper">
                      <button 
                        className={`kebab-trigger ${activeMenu === vehicle.vehicleID ? 'active' : ''}`}
                        onClick={(e) => handleKebabToggle(e, vehicle.vehicleID)}
                      >
                        ...
                      </button>
                      
                      {activeMenu === vehicle.vehicleID && (
                        <div className={`kebab-dropdown-card ${(() => {
                          const rect = document.querySelector(`[data-vehicle-id="${vehicle.vehicleID}"] .kebab-menu-wrapper`)?.getBoundingClientRect();
                          if (!rect) return '';
                          const spaceBelow = window.innerHeight - rect.bottom;
                          const spaceAbove = rect.top;
                          const dropdownHeight = 50;
                          return spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'open-up' : '';
                        })()}`}>
                          <button onClick={() => handleViewVehicle(vehicle.vehicleID)}>View</button>
                          <button onClick={() => handleEditVehicle(vehicle.vehicleID)}>Edit</button>
                          <button className="delete-item" onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(vehicle.vehicleID); }}>Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedVehicles.length > 0 && (
          <Pagination1
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            infoText={`Showing ${startIndex + 1}-${Math.min(endIndex, sortedVehicles.length)} of ${sortedVehicles.length}`}
          />
        )}
      </DashboardTemplate>
    </Layout>
  );
}