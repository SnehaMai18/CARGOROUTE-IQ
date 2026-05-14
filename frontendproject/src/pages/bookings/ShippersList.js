import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import DashboardTemplate from '../../components/DashboardTemplate';
import { AuthContext } from '../../auth/AuthContext';
import { getAllShippers } from '../../api/bookingsApi';
import { SHIPPER_STATUS_CONFIG as STATUS_CONFIG } from '../../utils/constants';
import { exportCSV } from '../../utils/csvExport';
import '../../styles/Bookings.css';
import Pagination1 from '../../components/Pagination1';

export default function ShippersList() {
  const [shippers, setShippers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 4;

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const loadShippers = () => {
    setLoading(true);
    getAllShippers()
      .then(setShippers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const getShipperId = (shipper) => Number(shipper?.shipperID ?? shipper?.id ?? shipper?.shipperId) || 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [shippers]);

  useEffect(loadShippers, []);

  const filtered = shippers.filter((s) => {
    const nameMatches = s.name?.toLowerCase().includes(search.toLowerCase());
    const statusMatches = statusFilter === 'ALL' || s.status === statusFilter;
    return nameMatches && statusMatches;
  });

  const sortedShippers = [...filtered].sort((a, b) => getShipperId(b) - getShipperId(a));
  const totalPages = Math.max(1, Math.ceil(sortedShippers.length / PAGE_SIZE));
  const paginated = sortedShippers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const stats = {
    total: shippers.length,
    active: shippers.filter(s => s.status === 'ACTIVE').length,
    inactive: shippers.filter(s => s.status === 'INACTIVE').length,
    suspended: shippers.filter(s => s.status === 'SUSPENDED').length,
  };

  const handleExport = () => {
    const headers = ['Name', 'Contact Info', 'Account Terms', 'Status'];
    const rows = filtered.map((s) => [s.name, s.contactInfo || '', s.accountTerms || '', s.status]);
    exportCSV('shippers.csv', headers, rows);
  };

  return (
    <Layout>
      <DashboardTemplate
        title="Shippers"
        subtitle="Manage registered shipper accounts"
        actionButtonLabel="+"
        onActionButtonClick={() => user?.role === 'Admin' && navigate('/shippers/new')}
        kpiCards={[
          { label: 'TOTAL SHIPPERS', value: stats.total },
          { label: 'ACTIVE', value: stats.active },
          { label: 'INACTIVE', value: stats.inactive },
          { label: 'SUSPENDED', value: stats.suspended },
        ]}
        contentCardTitle="All Shippers"
        searchPlaceholder="Search by name…"
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Status', value: 'ALL' },
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
        {/* Table */}
        {!loading && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#2e006c' }}>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Name</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Contact Info</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Account Terms</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e' }}>Status</th>
                  <th style={{ color: '#ffffff', fontWeight: 600, padding: '16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #370a6e', width: '60px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af', fontSize: '13px' }}>
                      {shippers.length === 0
                        ? (user?.role === 'Admin'
                          ? 'No shippers yet. Click + to add one.'
                          : 'No shippers available to display.')
                        : 'No shippers match your search.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((s) => {
                    const sc = STATUS_CONFIG[s.status] || { label: s.status };
                    return (
                      <tr key={s.shipperID} onClick={() => navigate(`/shippers/${s.shipperID}`)} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151', fontWeight: 600 }}>{s.name}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>{s.contactInfo || '–'}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>{s.accountTerms || '–'}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>
                          <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap', background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>{sc.label}</span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()} style={{ padding: '16px' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              style={{ background: 'none', border: 'none', fontSize: '16px', color: '#6b7280', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', height: '32px' }}
                              aria-label="Actions"
                              onClick={() => setOpenMenuId(openMenuId === s.shipperID ? null : s.shipperID)}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              ⋯
                            </button>
                            {openMenuId === s.shipperID && (
                              <div style={{ position: 'fixed', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', minWidth: '110px', zIndex: 9999, overflow: 'hidden' }}>
                                <button onClick={() => { setOpenMenuId(null); navigate(`/shippers/${s.shipperID}`); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#374151', cursor: 'pointer', transition: 'background-color 0.15s ease', borderBottom: '1px solid #f3f4f6' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                  View
                                </button>
                                {user?.role === 'Admin' && (
                                  <button onClick={() => { setOpenMenuId(null); navigate(`/shippers/${s.shipperID}/edit`); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#374151', cursor: 'pointer', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    Edit
                                  </button>
                                )}
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
    </Layout>
  );
}
