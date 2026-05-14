import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import DashboardTemplate from '../../components/DashboardTemplate';
import Pagination1 from '../../components/Pagination1';
import ActionMenuPortal from '../../components/ActionMenuPortal';
import { getAllManifests, deleteManifest } from '../../api/manifestApi';
import '../../styles/Bookings.css';
import '../../styles/DispatchManifests.css';
//We define some helper functions to format manifest IDs, load IDs, and date/time values for display in the UI. These functions ensure that the data is presented in a consistent and user-friendly format throughout the application. For example, manifest IDs are displayed with a "MF" prefix and zero-padded to 4 digits, while load IDs have an "LD" prefix. The date/time formatting converts ISO strings into a more readable format using the toLocaleString method with specific options for date and time components.
function formatManifestId(id) {
  return `MF${String(id).padStart(4, '0')}`;
}
function formatLoadId(id) {
  return id ? `LD${String(id).padStart(4, '0')}` : '–';
}
function formatDateTime(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const PAGE_SIZE = 4;


export default function ManifestList() {
  const navigate = useNavigate();
  const [manifests, setManifests] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [currentPage, setCurrentPage] = useState(1);

// Load manifests from API 
  const loadManifests = useCallback(() => {
    setLoading(true);
    getAllManifests()
      .then(setManifests)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);//useCallback to memoize the function and prevent unnecessary re-renders
  useEffect(() => { loadManifests(); }, [loadManifests]);
  useEffect(() => { setCurrentPage(1); }, [search]);// Reset to first page on new search

  const filtered = manifests.filter((m) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const mf = m.manifest || {};
    return (
      formatManifestId(mf.manifestID).toLowerCase().includes(q) ||
      (mf.loadID ? formatLoadId(mf.loadID).toLowerCase().includes(q) : false) ||
      (mf.createdBy || '').toLowerCase().includes(q) ||
      (m.load?.loadCode || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = {
    total:   manifests.length,
    today:   manifests.filter((m) => {
      const dt = m.manifest?.createdAt;
      if (!dt) return false;
      return new Date(dt).toDateString() === new Date().toDateString();
    }).length,
    withLoad: manifests.filter((m) => m.load?.loadID).length,
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this manifest? This cannot be undone.')) return;
    deleteManifest(id)
      .then(() => loadManifests())
      .catch((err) => console.error('Delete failed:', err));
  };

  const handleExport = () => {
    const headers = ['Manifest ID', 'Load ID', 'Created By', 'Created At'];
    const rows = filtered.map((m) => {
      const mf = m.manifest || {};
      return [
        formatManifestId(mf.manifestID),
        formatLoadId(mf.loadID),
        mf.createdBy || '–',
        formatDateTime(mf.createdAt),
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });//blob is a file-like object of immutable, raw data. In this case, we create a new Blob containing the CSV string with the MIME type 'text/csv'. This allows us to generate a downloadable file from the CSV data in memory without needing to create an actual file on the server.
    const url = URL.createObjectURL(blob);//create a temporary URL that points to the Blob object we just created. This URL can be used to download the Blob as a file when the user clicks the export button.
    const a = document.createElement('a');//create a new anchor element in the DOM. This anchor element will be used to trigger the download of the CSV file when the user clicks the export button.
    a.href = url;//set the href attribute of the anchor element to the temporary URL that points to the Blob. This means that when the anchor is clicked, it will download the content of the Blob (the CSV data) instead of navigating to a new page.
    a.download = 'manifests.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <DashboardTemplate
        title="Manifests"
        subtitle="Manage shipment manifests and load documentation"
        actionButtonLabel="+"
        onActionButtonClick={() => navigate('/manifests/new')}
        kpiCards={[
          { label: 'TOTAL MANIFESTS', value: stats.total },
          { label: 'CREATED TODAY', value: stats.today },
          { label: 'WITH LOAD DATA', value: stats.withLoad },
          // { label: 'READY', value: Math.max(0, stats.total - stats.withLoad) },
        ]}
        contentCardTitle="All Manifests"
        searchPlaceholder="Search by manifest ID, load code, created by…"
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        filters={[]}
        exportButtonLabel="Export"
        onExport={handleExport}
        loading={loading}
        error={null}
      >
        {/* Table */}
        {!loading && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#2e006c' }}>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Manifest ID</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Load ID</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Created By</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Created At</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e', width: '60px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af', fontSize: '13px' }}>
                      {manifests.length === 0 ? 'No manifests yet. Create one to get started.' : 'No manifests match your search.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((m) => {
                    const mf = m.manifest || {};
                    return (
                      <tr key={mf.manifestID} onClick={() => navigate(`/manifests/${mf.manifestID}`)} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151', textAlign: 'left' }}>{formatManifestId(mf.manifestID)}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151', textAlign: 'left' }}>{formatLoadId(mf.loadID)}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151', textAlign: 'left' }}>{mf.createdBy || '–'}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151', textAlign: 'left' }}>{formatDateTime(mf.createdAt)}</td>
                        <td onClick={(e) => e.stopPropagation()} style={{ padding: '16px', textAlign: 'right' }}>
                          <ActionMenuPortal
                            id={mf.manifestID}
                            actions={[
                              { label: 'View', onClick: () => navigate(`/manifests/${mf.manifestID}`) },
                              { label: 'Edit', onClick: () => navigate(`/manifests/${mf.manifestID}`, { state: { edit: true } }) },
                              { label: 'Delete', onClick: () => handleDelete(mf.manifestID), danger: true }
                            ]}
                          />
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
                  infoText={`Page ${currentPage} of ${totalPages}`}
                />
              </div>
            )}
          </div>
        )}
      </DashboardTemplate>
    </Layout>
  );
}
