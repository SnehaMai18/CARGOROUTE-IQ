import React from 'react';
import '../styles/VehicleAvailabilityCard.css';

export default function VehicleAvailabilityCard({ availabilities = [] }) {
  // Format date to display only date part (MM/DD/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format time to display only time part (HH:MM)
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  // Get status color class
  const getStatusClass = (status) => {
    if (!status) return '';
    const normalizedStatus = status.toUpperCase();
    if (normalizedStatus === 'AVAILABLE') return 'status-available';
    if (normalizedStatus === 'UNAVAILABLE') return 'status-unavailable';
    return '';
  };

  // Handle empty state
  if (!availabilities || availabilities.length === 0) {
    return (
      <div className="availability-container">
        <h3 className="availability-title">Vehicle Availability</h3>
        <div className="availability-empty">No availability records</div>
      </div>
    );
  }

  return (
    <div className="availability-container">
      <h3 className="availability-title">Vehicle Availability</h3>
      <div className="availability-cards-grid">
        {availabilities.map((item, index) => (
          <div key={index} className="availability-card-item">
            {/* Top: Date */}
            <div className="card-header">
              <span className="card-date">{formatDate(item.date)}</span>
            </div>

            {/* Middle: Time Range */}
            <div className="card-times">
              <div className="time-block">
                <span className="time-label">Start</span>
                <span className="time-value">{formatTime(item.startTime)}</span>
              </div>
              <div className="time-separator">→</div>
              <div className="time-block">
                <span className="time-label">End</span>
                <span className="time-value">{formatTime(item.endTime)}</span>
              </div>
            </div>

            {/* Status - right below End */}
            <div className="card-status">
              <span className="status-label-text">Status:</span>
              <span className={`status-badge ${getStatusClass(item.status)}`}>
                {item.status ? item.status.toUpperCase() : 'N/A'}
              </span>
            </div>

            {/* Reason (if available) */}
            {item.reason || item.reasonNote ? (
              <div className="card-reason">
                <span className="reason-text">{item.reason || item.reasonNote}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
