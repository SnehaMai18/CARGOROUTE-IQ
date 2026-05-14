import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import Layout from '../../components/Layout';
import VehicleAvailabilityCard from '../../components/VehicleAvailabilityCard';
import { getVehicleById, getVehicleAvailability, deleteVehicle } from '../../api/fleetApi';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/Fleet.css';
 
export default function VehicleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
 
    const [vehicle, setVehicle] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false });
 
    const normalizeAvailabilities = (value) => {
        if (Array.isArray(value)) return value;
        if (Array.isArray(value?.content)) return value.content;
        if (Array.isArray(value?.data)) return value.data;
        if (Array.isArray(value?.availabilities)) return value.availabilities;
        return [];
    };
 
    const fetchVehicle = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
 
            const data = await getVehicleById(id);
            setVehicle(data);
 
            const embeddedAvailabilities = normalizeAvailabilities(data?.availabilities);
            setAvailabilities(embeddedAvailabilities);
 
            try {
                const avail = await getVehicleAvailability(id);
                const apiAvailabilities = normalizeAvailabilities(avail);
                if (apiAvailabilities.length > 0) {
                    setAvailabilities(apiAvailabilities);
                }
            } catch (_) {
                // Keep embedded availabilities if endpoint fails
            }
        } catch (_) {
            setError('Failed to load vehicle details');
        } finally {
            setLoading(false);
        }
    }, [id]);
 
    useEffect(() => {
        fetchVehicle();
    }, [fetchVehicle]);
 
    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
 
    const getStatusClass = (status) => {
        const upperStatus = status?.toUpperCase() || 'UNKNOWN';
        if (upperStatus === 'ACTIVE' || upperStatus === 'AVAILABLE') return 'status-available';
        if (upperStatus === 'UNAVAILABLE' || upperStatus === 'IN_USE') return 'status-inuse';
        if (upperStatus === 'MAINTENANCE') return 'status-maintenance';
        return 'status-unknown';
    };
 
    const handleDeleteVehicle = async () => {
        if (!vehicle?.vehicleID) return;
        try {
            await deleteVehicle(vehicle.vehicleID);
            navigate('/fleet/vehicles');
        } catch (_) {
            setError('Failed to delete vehicle');
        }
    };
 
    if (loading) {
        return (
            <Layout>
                <div className="fleet-container vehicle-detail-page">
                    <div className="loading">Loading vehicle details...</div>
                </div>
            </Layout>
        );
    }
 
    if (error || !vehicle) {
        return (
            <Layout>
                <div className="fleet-container vehicle-detail-page">
                    <div className="alert alert-error">
                        <span>⚠</span> {error || 'Vehicle not found'}
                    </div>
                    <button className="btn-back" onClick={() => navigate('/fleet/vehicles')}>
                        Back to Fleet
                    </button>
                </div>
            </Layout>
        );
    }
 
    return (
        <Layout>
            <div className="fleet-container vehicle-detail-page">
                <div className="detail-header">
                    <div className="detail-header-left">
                        <button className="back-btn" onClick={() => navigate('/fleet/vehicles')}>←</button>
                        <div>
                            <h1 className="detail-title">{vehicle.regNumber}</h1>
                        </div>
                    </div>
                    <div className="detail-header-right">
                        {/* action buttons can go here */}
                    </div>
                </div>
 
                <div className="detail-cards">
                    <div className="detail-card info-card">
                        <h3>Vehicle Information</h3>
                        <div className="detail-row">
                            <span className="label">Registration:</span>
                            <span className="value reg-number-value">{vehicle.regNumber}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Type:</span>
                            <span className="value">{vehicle.type || 'Not specified'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Status:</span>
                            <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                                {vehicle.status || 'Unknown'}
                            </span>
                        </div>
                    </div>
 
                    <div className="detail-card capacity-card">
                        <h3>Capacity</h3>
                        <div className="detail-row">
                            <span className="label">Max Weight:</span>
                            <span className="value">{vehicle.maxWeightKg?.toLocaleString() || 0} kg</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Max Volume:</span>
                            <span className="value">{vehicle.maxVolumeM3 || 0} m³</span>
                        </div>
                    </div>
 
                    <div className="detail-card assignment-card">
                        <h3>Assignment</h3>
                        <div className="detail-row">
                            <span className="label">Assigned Driver:</span>
                            <span className="value">{vehicle.driver?.name || 'Shiva'}</span>
                              {/* hardcoded shiva instead of unassigned  */}
                        </div>
                        <div className="detail-row">
                            <span className="label">Driver ID:</span>
                            <span className="value">{vehicle.driverID || 'None'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Email:</span>
                            <span className="value">{vehicle.driver.contactInfo || 'None'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Mobile :</span>
                            <span className="value">{vehicle.driver.mobileNumber || 'None'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">licenseNo:</span>
                            <span className="value">{vehicle.driver.licenseNo || 'None'}</span>
                        </div>
                    </div>
 
                    <div className="detail-card maintenance-card">
                        <h3>Maintenance</h3>
                        <div className="detail-row">
                            <span className="label">Last Maintenance:</span>
                            <span className="value">{formatDate(vehicle.lastMaintenanceAt)}</span>
                        </div>
                    </div>
 
                    <div className="detail-card availability-card">
                        <VehicleAvailabilityCard availabilities={availabilities} />
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
 
 
 