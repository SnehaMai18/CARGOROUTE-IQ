import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getRouteById, deleteRoute } from '../../api/routingApi';
import { FiEdit2 } from 'react-icons/fi';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/Routing.css';
 
export default function RouteDetailsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false });
 
  const fetchRoute = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRouteById(id);
      setRoute(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching route:', err);
      setError('Failed to load route details');
    } finally {
      setLoading(false);
    }
  }, [id]);
 
  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);
 
  const handleDeleteRoute = async () => {
    if (!route?.routeID) return;
    try {
      await deleteRoute(route.routeID);
      navigate('/routing/routes');
    } catch (err) {
      console.error('Error deleting route:', err);
      setError('Failed to delete route. Please try again.');
    }
  };
 
  const getStatusClass = (status) => {
    const upperStatus = status?.toUpperCase() || 'UNKNOWN';
    if (upperStatus === 'PLANNED') return 'status-planned';
    if (upperStatus === 'IN_PROGRESS') return 'status-inprogress';
    if (upperStatus === 'COMPLETED') return 'status-completed';
    return 'status-unknown';
  };
 
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
 
  if (loading) {
    return (
      <Layout>
        <div className="routing-container">
          <div className="loading">Loading route details...</div>
        </div>
      </Layout>
    );
  }
 
  if (error || !route) {
    return (
      <Layout>
        <div className="routing-container">
          <div className="error-message">
            <span>{error || 'Route not found'}</span>
            <button onClick={() => navigate('/routing/routes')}>Back to Routes</button>
          </div>
        </div>
      </Layout>
    );
  }
 
  return (
    <Layout>
      <div className="routing-container">
        <div className="detail-header">
          <div className="detail-title-section">
            <h1 className="detail-title">Route ID: {route.routeID}</h1>
            <p className="detail-subtitle">{route.status || 'Unknown'} Status</p>
          </div>
          <div className="detail-actions">
            <button
              className="btn-delete icon-btn"
              onClick={() => setConfirmModal({ open: true, type: 'delete', title: 'Confirm Delete', message: 'Are you sure you want to delete this route? This action cannot be undone.', onConfirm: handleDeleteRoute })}
            >
              <span className="icon-btn-icon">🗑️</span>
              <span className="icon-btn-label">Delete</span>
            </button>
            <button
              className="btn-edit icon-btn"
              onClick={() => navigate(`/routing/routes/${route.routeID}/edit`)}
            >
              <span className="icon-btn-icon"><FiEdit2 size={16} /></span>
              <span className="icon-btn-label">Edit</span>
            </button>
            <button
              className="btn-back icon-btn"
              onClick={() => navigate('/routing/routes')}
            >
              <span className="icon-btn-icon">←</span>
              <span className="icon-btn-label">Back</span>
            </button>
          </div>
        </div>
 
        <div className="detail-cards">
          <div className="detail-card info-card">
            <h3>Route Information</h3>
            <div className="detail-row">
              <span className="label">Load Code:</span>
              <span className="value load-code-value">{route.load?.loadCode || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className={`status-badge ${getStatusClass(route.status)}`}>
                {route.status || 'Unknown'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Route ID:</span>
              <span className="value">{route.routeID}</span>
            </div>
          </div>
 
          <div className="detail-card distance-card">
            <h3>Distance & Duration</h3>
            <div className="detail-row">
              <span className="label">Total Distance:</span>
              <span className="value">{route.distanceKm ? route.distanceKm.toFixed(2) : '-'} km</span>
            </div>
            <div className="detail-row">
              <span className="label">Estimated Duration:</span>
              <span className="value">{route.estimatedDurationMin || '-'} minutes</span>
            </div>
          </div>
 
          <div className="detail-card cost-card">
            <h3>Cost Estimate</h3>
            <div className="detail-row">
              <span className="label">Estimated Cost:</span>
              <span className="value cost-highlight">₹ {route.costEstimate ? route.costEstimate.toFixed(2) : '-'}</span>
            </div>
          </div>
 
          <div className="detail-card load-card">
            <h3>Load Details</h3>
            <div className="detail-row">
              <span className="label">Total Weight:</span>
              <span className="value">{route.load?.totalWeightKg ? route.load.totalWeightKg.toLocaleString() : '-'} kg</span>
            </div>
            <div className="detail-row">
              <span className="label">Total Volume:</span>
              <span className="value">{route.load?.totalVolumeM3 || '-'} m³</span>
            </div>
            <div className="detail-row">
              <span className="label">Planned Start:</span>
              <span className="value">{formatDate(route.load?.plannedStart)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Planned End:</span>
              <span className="value">{formatDate(route.load?.plannedEnd)}</span>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmModal.open}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => { setConfirmModal({ open: false }); confirmModal.onConfirm?.(); }}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </Layout>
  );
}
 
 