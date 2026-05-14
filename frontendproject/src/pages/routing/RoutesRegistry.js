import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getAllRoutes } from '../../api/routingApi';
import '../../styles/Routing.css';

export default function RoutesRegistry() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    planned: 0,
    inProgress: 0,
    completed: 0,
  });

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllRoutes();
      const routeList = Array.isArray(data) ? data : [];
      const sortedRoutes = [...routeList].sort((a, b) => getRouteId(b) - getRouteId(a));
      setRoutes(sortedRoutes);
      calculateStats(sortedRoutes);
      setFilteredRoutes(sortedRoutes);
      setError(null);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to load routes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    if (routes.length > 0) {
      const filtered = routes.filter((route) =>
        (route.load?.loadCode && route.load.loadCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (route.status && route.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (route.distanceKm && route.distanceKm.toString().includes(searchTerm))
      );
      setFilteredRoutes(filtered);
    }
  }, [searchTerm, routes]);

  const getRouteId = (route) => Number(route?.routeID ?? route?.id ?? route?.routeId) || 0;

  const calculateStats = (routeList) => {
    const stats = {
      total: routeList.length,
      planned: routeList.filter(r => r.status?.toUpperCase() === 'PLANNED').length,
      inProgress: routeList.filter(r => r.status?.toUpperCase() === 'IN_PROGRESS').length,
      completed: routeList.filter(r => r.status?.toUpperCase() === 'COMPLETED').length,
    };
    setStats(stats);
  };

  const handleAddRoute = () => {
    navigate('/routing/routes/new');
  };

  const handleViewRoute = (routeId) => {
    navigate(`/routing/route/${routeId}`);
  };

  const getStatusBadgeClass = (status) => {
    const upperStatus = status?.toUpperCase() || 'UNKNOWN';
    if (upperStatus === 'PLANNED') return 'status-planned';
    if (upperStatus === 'IN_PROGRESS') return 'status-inprogress';
    if (upperStatus === 'COMPLETED') return 'status-completed';
    return 'status-unknown';
  };

  // const formatDate = (dateString) => {
  //   if (!dateString) return '-';
  //   return new Date(dateString).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'numeric',
  //     day: 'numeric',
  //   });
  // };

  
  if (loading) {
    return (
      <Layout>
        <div className="routing-container">
          <div className="loading">Loading routes data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="routing-container">
        <div className="routing-header">
          <div className="routing-title-section">
            <h1 className="routing-title">Route Optimization</h1>
            <p className="routing-subtitle">Manage routes and optimize deliveries</p>
          </div>
          <button className="btn-add-route" onClick={handleAddRoute} title="Create Route">
            <span className="btn-icon">+</span>
          </button>
        </div>

        <div className="routing-stats">
          <div className="stat-card">
            <div className="stat-summary">
              <span className="stat-label">Total Routes</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-icon">🛣️</div>
          </div>
          <div className="stat-card">
            <div className="stat-summary">
              <span className="stat-label">Planned</span>
              <span className="stat-value stat-value-planned">{stats.planned}</span>
            </div>
            <div className="stat-icon">📋</div>
          </div>
          <div className="stat-card">
            <div className="stat-summary">
              <span className="stat-label">In Progress</span>
              <span className="stat-value stat-value-inprogress">{stats.inProgress}</span>
            </div>
            <div className="stat-icon">🚗</div>
          </div>
          <div className="stat-card">
            <div className="stat-summary">
              <span className="stat-label">Completed</span>
              <span className="stat-value stat-value-completed">{stats.completed}</span>
            </div>
            <div className="stat-icon">✓</div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="routes-section">
          <div className="routes-header">
            <h2>All Routes</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search by load code, status or distance"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {filteredRoutes.length === 0 ? (
            <div className="no-routes">
              <p>No routes found</p>
              <button onClick={handleAddRoute} className="btn-add-first">
                Create Your First Route
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="routes-table">
                <thead>
                  <tr>
                    <th>Load Code</th>
                    <th>Distance (km)</th>
                    <th>Duration (min)</th>
                    <th>Cost Estimate</th>
                    <th>Weight (kg)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.map((route) => (
                    <tr key={route.routeID} className="route-row">
                      <td className="load-code">{route.load?.loadCode || '-'}</td>
                      <td>{route.distanceKm ? route.distanceKm.toFixed(2) : '-'}</td>
                      <td>{route.estimatedDurationMin || '-'}</td>
                      <td className="cost">₹ {route.costEstimate ? route.costEstimate.toFixed(2) : '-'}</td>
                      <td>{route.load?.totalWeightKg ? route.load.totalWeightKg.toLocaleString() : '-'}</td>
                      <td className="status-column">
                        <span className={`status-badge ${getStatusBadgeClass(route.status)}`}>
                          {route.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewRoute(route.routeID)}
                          aria-label="View"
                        >
                          ⋮
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
