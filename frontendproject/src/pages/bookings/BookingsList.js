import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import DashboardTemplate from '../../components/DashboardTemplate';
import { getAllBookings, importBookingsCsv } from '../../api/bookingsApi';
import { siteName, STATUS_CONFIG } from '../../utils/constants';
import { exportCSV } from '../../utils/csvExport';
import '../../styles/Bookings.css';
import '../../styles/Fleet.css';
import { AuthContext } from '../../auth/AuthContext';
import Pagination1 from '../../components/Pagination1';

function formatBookingId(id) {
  return `BK${String(id).padStart(3, '0')}`;
}

export default function BookingsList() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const ALLOWED_CREATE_ROLES = ['Admin', 'Shipper'];
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [importing, setImporting]       = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef                    = useRef(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const PAGE_SIZE = 4;
  const [openMenuId, setOpenMenuId] = useState(null);
  const openUpRef = useRef({});

  const loadBookings = () => {
    setLoading(true);
    getAllBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBookings(); }, []);

  // Reset to first page whenever search/filter changes
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const shipperName = b.shipper?.name?.toLowerCase() || '';
    const matchSearch =
      !q ||
      formatBookingId(b.bookingID).toLowerCase().includes(q) ||
      shipperName.includes(q) ||
      b.commodity?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === 'PENDING' || b.status === 'SUBMITTED').length,
    inTransit: bookings.filter((b) => b.status === 'IN_TRANSIT' || b.status === 'DISPATCHED').length,
    delivered: bookings.filter((b) => b.status === 'DELIVERED').length,
  };

  const handleExport = () => {
    const headers = ['Booking ID','Shipper','Origin Site','Destination Site',
      'Pickup Start','Pickup End','Weight (kg)','Volume (m³)','Units','Commodity','Status'];
    const rows = filtered.map((b) => [
      formatBookingId(b.bookingID), b.shipper?.name,
      siteName(b.originSiteID), siteName(b.destinationSiteID),
      b.pickupWindowStart, b.pickupWindowEnd,
      b.weightKg, b.volumeM3, b.pieces, b.commodity, b.status,
    ]);
    exportCSV('bookings.csv', headers, rows);
  };

  const handleDownloadTemplate = () => {
    const header = 'shipperId,originSiteID,destinationSiteID,pickupWindowStart,pickupWindowEnd,deliveryWindowStart,deliveryWindowEnd,weightKg,volumeM3,pieces,commodity,specialHandlingFlags';
    const sample = '1,1,2,2026-04-15T10:00:00,2026-04-15T14:00:00,2026-04-16T09:00:00,2026-04-16T17:00:00,500,2.5,10,Electronics,';
    const csv  = [header, sample].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'bookings_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    
    if (!file.name || !file.name.toLowerCase().endsWith('.csv')) {
      setImportResult({ error: 'Unsupported file format. Please upload a CSV file.' });
      return;
    }
    
    const REQUIRED_HEADERS = [
      'shipperId', 'originSiteID', 'destinationSiteID',
      'pickupWindowStart', 'pickupWindowEnd',
      'deliveryWindowStart', 'deliveryWindowEnd',
      'weightKg', 'volumeM3', 'pieces', 'commodity'
    ];

    try {
      const text = await file.text();
      const firstLine = text.split(/\r?\n/)[0] || '';
      const headerCols = firstLine.split(',').map((h) => h.trim());
      const missing = REQUIRED_HEADERS.filter((h) => !headerCols.includes(h));
      if (missing.length > 0) {
        const label = missing.length === 1 ? 'Missing required column header: ' : 'Missing required column headers: ';
        setImportResult({ error: `Import failed.\n\n${label}${missing.join(', ')}\n\nNo bookings were imported.` });
        return;
      }
    } catch (err) {
      setImportResult({ error: 'Import failed. Could not read the CSV file.' });
      return;
    }

    setImporting(true);
    setImportResult(null);
    try {
      const result = await importBookingsCsv(file);
      setImportResult(result);
      if (result.imported > 0) loadBookings();
    } catch (err) {
      setImportResult({ error: err.response?.data?.error || 'Import failed. Check your CSV format.' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Layout>
      <DashboardTemplate
        title="Bookings"
        subtitle="Manage all freight bookings and orders"
        actionButtonLabel="+"
        onActionButtonClick={() => ALLOWED_CREATE_ROLES.includes(user?.role) && navigate('/bookings/new')}
        kpiCards={[
          { label: 'TOTAL BOOKINGS', value: stats.total },
          { label: 'PENDING', value: stats.pending },
          { label: 'IN TRANSIT', value: stats.inTransit },
          { label: 'DELIVERED', value: stats.delivered },
        ]}
        contentCardTitle="All Bookings"
        searchPlaceholder="Search by booking ID, shipper, or commodity..."
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'Status', value: 'ALL' },
              ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ label: v.label, value: k })),
            ],
            onChange: (e) => setStatusFilter(e.target.value),
          },
        ]}
        exportButtonLabel="Export"
        onExport={handleExport}
        loading={loading}
        error={null}
      >
        {/* Import result banner */}
        {importResult && (
          <div className={`import-result ${importResult.error ? 'import-result-error' : importResult.failed > 0 ? 'import-result-warn' : 'import-result-ok'}`}>
            {importResult.error ? (
              <span>❌ {importResult.error}</span>
            ) : (
              <span>
                ✅ <strong>{importResult.imported}</strong> booking{importResult.imported !== 1 ? 's' : ''} imported
                {importResult.failed > 0 && (
                  <span className="import-errors">
                    &nbsp;·&nbsp;⚠ {importResult.failed} row{importResult.failed !== 1 ? 's' : ''} failed:
                    <ul>{importResult.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                  </span>
                )}
              </span>
            )}
            <button className="import-result-close" onClick={() => setImportResult(null)}>✕</button>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#2e006c' }}>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Booking Id</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Shipper</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Origin</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Destination</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Status</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e', width: '60px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af', fontSize: '13px' }}>
                      {bookings.length === 0
                        ? (ALLOWED_CREATE_ROLES.includes(user?.role)
                            ? 'No bookings yet. Create your first booking.'
                            : 'No bookings available to display.')
                        : 'No bookings match your search.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((b) => {
                    const st = STATUS_CONFIG[b.status] || { label: b.status };
                    return (
                      <tr key={b.bookingID} onClick={() => navigate(`/bookings/${b.bookingID}`)} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>{formatBookingId(b.bookingID)}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>{b.shipper?.name || '–'}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>{siteName(b.originSiteID)}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>{siteName(b.destinationSiteID)}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>
                          <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap', background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>{st.label}</span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()} style={{ padding: '16px' }}>
                          <div className="kebab-menu-wrapper">
                            <button
                              className={`kebab-trigger ${openMenuId === b.bookingID ? 'active' : ''}`}
                              onClick={(e) => {
                                if (openMenuId === b.bookingID) {
                                  setOpenMenuId(null);
                                  return;
                                }
                                
                                // Calculate position immediately
                                const rect = e.target.closest('.kebab-menu-wrapper').getBoundingClientRect();
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const spaceAbove = rect.top;
                                const dropdownHeight = 50; // approximate height
                                const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
                                
                                openUpRef.current[b.bookingID] = shouldOpenUp;
                                setOpenMenuId(b.bookingID);
                              }}
                              aria-label="Actions"
                            >
                              ...
                            </button>
                            {openMenuId === b.bookingID && (
                              <div className={`kebab-dropdown-card ${openUpRef.current[b.bookingID] ? 'open-up' : ''}`}>
                                <button onClick={() => { setOpenMenuId(null); navigate(`/bookings/${b.bookingID}`); }}>
                                  View
                                </button>
                                <button onClick={() => { setOpenMenuId(null); navigate(`/bookings/${b.bookingID}/edit`); }}>
                                  Edit
                                </button>
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
                <Pagination1
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </DashboardTemplate>
      
      {/* Hidden file input for imports */}
      {ALLOWED_CREATE_ROLES.includes(user?.role) && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
      )}
    </Layout>
  );
}
