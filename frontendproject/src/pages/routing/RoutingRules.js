import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import DashboardTemplate from '../../components/DashboardTemplate';
import { exportCSV } from '../../utils/csvExport';
import useSort from '../../hooks/useSort';
import { getAllRoutingRules } from '../../api/routingApi';
import '../styles/Routing.css';

export default function RoutingRules() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const prioritySort = useSort('none');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const getRuleId = (item) => item?.ruleID ?? item?.ruleId ?? item?.id ?? null;

  const normalizeKey = (key) => String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const parseConditions = (conditionsJSON) => {
    if (!conditionsJSON) {
      return {
        origin: '-',
        destination: '-',
        commodity: '-',
        pairs: [],
      };
    }

    try {
      const parsed = JSON.parse(conditionsJSON);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Invalid condition payload');
      }

      const entries = Object.entries(parsed);
      const usedIndexes = new Set();

      const pickValue = (candidates) => {
        const index = entries.findIndex(([key]) => candidates.includes(normalizeKey(key)));
        if (index >= 0) {
          usedIndexes.add(index);
          return entries[index][1];
        }
        return null;
      };

      const origin = pickValue(['origin', 'source', 'from']) ?? '-';
      const destination = pickValue(['destination', 'dest', 'to']) ?? '-';
      const commodity = pickValue(['commodity', 'product', 'goods', 'material']) ?? '-';

      const pairs = entries.map(([key, value]) => ({
        key,
        value: value ?? '-',
      }));

      return {
        origin,
        destination,
        commodity,
        pairs,
      };
    } catch {
      return {
        origin: '-',
        destination: '-',
        commodity: '-',
        pairs: [{ key: 'Conditions', value: String(conditionsJSON) }],
      };
    }
  };

  const getRuleStatus = (rule) => {
    const explicitStatus = String(rule?.status || '').trim().toLowerCase();
    if (explicitStatus === 'maintenance') return 'maintenance';
    if (explicitStatus === 'active') return 'active';
    if (explicitStatus === 'inactive') return 'inactive';
    return rule?.active ? 'active' : 'inactive';
  };

  const getRuleStatusBadgeClass = (status) => {
    if (status === 'active') return 'rule-status-active';
    if (status === 'maintenance') return 'rule-status-maintenance';
    return 'rule-status-inactive';
  };

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllRoutingRules();
      setRules(data);
    } catch (err) {
      setError('Failed to load routing rules. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Filter
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(getRuleId(rule) ?? '').includes(searchTerm) ||
      String(rule.priority ?? '').includes(searchTerm);

    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && rule.active === true) ||
      (filterActive === 'inactive' && rule.active === false);

    return matchesSearch && matchesActive;
  });

  // Sort by priority
  const sortedRules = [...filteredRules].sort((a, b) => {
    const aPriority = a.priority ?? 0;
    const bPriority = b.priority ?? 0;
    if (prioritySort.direction === 'asc') return aPriority - bPriority;
    if (prioritySort.direction === 'desc') return bPriority - aPriority;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedRules.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRules = sortedRules.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterActive, prioritySort.direction]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Stats
  const stats = {
    total: rules.length,
    active: rules.filter((r) => r.active === true).length,
    inactive: rules.filter((r) => r.active === false).length,
    highPriority: rules.filter((r) => (r.priority ?? 0) >= 8).length,
  };

  const exportRules = () => {
    const headers = ['Rule ID', 'Name', 'Priority', 'Conditions', 'Active'];
    const rows = sortedRules.map((rule) => [
      getRuleId(rule) ?? '',
      rule.name ?? '',
      rule.priority ?? '',
      rule.conditionsJSON ?? '',
      rule.active ? 'Yes' : 'No',
    ]);
    exportCSV('routing-rules.csv', headers, rows);
  };

  if (loading) {
    return (
      <Layout>
        <div className="routing-container">
          <div className="loading-spinner">Loading routing rules...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {error && (
        <div className="alert alert-error">
          <span>⚠</span> {error}
        </div>
      )}
      <DashboardTemplate
        title="Routing Rules"
        subtitle="Manage and configure automated routing rules"
        contentCardTitle="All Rules"
        actionButtonLabel="+"
        onActionButtonClick={() => navigate('/routing/rules/new')}
        kpiCards={[
          { label: 'Total Rules', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Inactive', value: stats.inactive },
          { label: 'High Priority', value: stats.highPriority }
        ]}
        searchPlaceholder="Search by Rule ID or Name..."
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filters={[
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            value: filterActive,
            onChange: (e) => setFilterActive(e.target.value),
            options: [
              { value: 'all', label: 'Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        ]}
        exportButtonLabel="Export"
        onExport={exportRules}
      >
        <div className="table-container">
          <table className="routes-table routing-rules-table">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Name</th>
                <th>
                  <button type="button" className="sortable-header" tabIndex={-1} onClick={(e) => { e.preventDefault(); e.stopPropagation(); prioritySort.toggle(); e.currentTarget.blur(); }}>
                    Priority
                    <span className={`sort-arrow ${prioritySort.direction !== 'none' ? 'active' : ''}`}>{prioritySort.icon}</span>
                  </button>
                </th>
                <th>Conditions</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRules.length > 0 ? (
                paginatedRules.map((rule) => {
                  const conditionData = parseConditions(rule.conditionsJSON);
                  const status = getRuleStatus(rule);

                  return (
                  <tr key={getRuleId(rule) ?? `rule-${rule.name || 'unknown'}`}>
                    <td className="font-medium">{getRuleId(rule) ?? '-'}</td>
                    <td>{rule.name || '-'}</td>
                    <td className="priority-cell">{rule.priority ?? '-'}</td>
                    <td className="conditions-cell">
                      <div className="conditions-structured" aria-label="Rule conditions">
                        <div className="condition-item">
                          <span className="condition-key">Origin</span>
                          <span className="condition-value">{String(conditionData.origin)}</span>
                        </div>
                        <div className="condition-item">
                          <span className="condition-key">Destination</span>
                          <span className="condition-value">{String(conditionData.destination)}</span>
                        </div>
                        <div className="condition-item">
                          <span className="condition-key">Commodity</span>
                          <span className="condition-value">{String(conditionData.commodity)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${getRuleStatusBadgeClass(status)}`}>
                        {status === 'maintenance' ? 'Maintenance' : status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => {
                          const ruleId = getRuleId(rule);
                          if (ruleId !== null && ruleId !== undefined && ruleId !== '') {
                            navigate(`/routing/rules/${ruleId}`);
                          }
                        }}
                        disabled={getRuleId(rule) === null || getRuleId(rule) === undefined || getRuleId(rule) === ''}
                        aria-label="View"
                      >
                        ⋯
                      </button>
                    </td>
                  </tr>
                );})
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No routing rules found. Click "+" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sortedRules.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1}–{Math.min(endIndex, sortedRules.length)} of {sortedRules.length}
            </div>
            <div className="pagination-controls">
              <button
                type="button"
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </DashboardTemplate>
    </Layout>
  );
}
