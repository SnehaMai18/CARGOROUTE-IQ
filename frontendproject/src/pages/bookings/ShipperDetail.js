import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getShipperById } from '../../api/bookingsApi';
import { SHIPPER_STATUS_CONFIG } from '../../utils/constants';
import '../../styles/Bookings.css';
import { AuthContext } from '../../auth/AuthContext';

export default function ShipperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipper, setShipper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    getShipperById(id)
      .then((s) => setShipper(s))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><div className="empty-state">Loading…</div></Layout>;
  if (notFound || !shipper) return <Layout><div className="empty-state">Shipper not found.</div></Layout>;

  return (
    <Layout>
      <div className="booking-detail-page">
        <div className="detail-header">
          <div className="detail-header-left">
            <button className="back-btn" onClick={() => navigate('/shippers')}>←</button>
            <div>
              <div className="detail-booking-id">SH{String(shipper.shipperID).padStart(4, '0')}</div>
              <div className="page-subtitle">Shipper Detail</div>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-card detail-card-leftwide">
            <h3 className="detail-card-title">Shipper Information</h3>
            <div className="detail-row-2">
              <div className="detail-field">
                <div className="detail-label">Name</div>
                <div className="detail-value">{shipper.name}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Contact Info</div>
                <div className="detail-value">{shipper.contactInfo || '–'}</div>
              </div>
            </div>

            <div className="detail-row-2" style={{ marginTop: 12 }}>
              <div className="detail-field">
                <div className="detail-label">Account Terms</div>
                <div className="detail-value">{shipper.accountTerms || '–'}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  {(() => {
                    const conf = SHIPPER_STATUS_CONFIG[shipper.status] || { label: shipper.status, cls: 'status-pending' };
                    return <span className={`status-badge ${conf.cls}`}>{conf.label}</span>;
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Removed duplicate Status card — status is shown inside the main card */}
        </div>
      </div>
    </Layout>
  );
}
