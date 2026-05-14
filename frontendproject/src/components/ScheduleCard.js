import React from 'react';

const formatDateTime = (value) => {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ScheduleCard({ schedule }) {
  const plannedStart = schedule?.plannedStart;
  const plannedEnd = schedule?.plannedEnd;
  const stops = Array.isArray(schedule?.stops) ? schedule.stops : [];

  return (
    <div className="schedule-card-grid">
      <div className="schedule-meta-row">
        <span className="label">Planned Start:</span>
        <span className="value">{formatDateTime(plannedStart)}</span>
      </div>
      <div className="schedule-meta-row">
        <span className="label">Planned End:</span>
        <span className="value">{formatDateTime(plannedEnd)}</span>
      </div>

      <div className="booking-table-wrap schedule-table-wrap">
        <table className="booking-mini-table schedule-stops-table">
          <thead>
            <tr>
              <th>Stop ID</th>
              <th>Location</th>
              <th>ETA</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {stops.length > 0 ? (
              stops.map((stop, index) => (
                <tr key={`stop-${stop?.stopID ?? index}`}>
                  <td>{stop?.stopID ?? '-'}</td>
                  <td>{stop?.location || '-'}</td>
                  <td>{formatDateTime(stop?.eta)}</td>
                  <td>{stop?.action || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No stop data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
