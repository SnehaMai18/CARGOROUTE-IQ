import React, { useEffect } from 'react';
import '../styles/DashboardTemplate.css';

/**
 * DashboardTemplate Component
 * 
 * Provides a reusable layout for dashboard pages with:
 * - Header section (title, subtitle, action button)
 * - KPI statistics cards (4 cards with label and value)
 * - Content card with search/filters and table
 * - Status badge styling
 */
export default function DashboardTemplate({
  title = 'Dashboard',
  subtitle = '',
  actionButtonLabel = '+',
  onActionButtonClick = () => {},
  kpiCards = [], // Array of { label: string, value: number }
  contentCardTitle = 'All Items', // Title above search/filters
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange = () => {},
  filters = [], // Array of { label, value, options: [{label, value}], onChange }
  exportButtonLabel = 'Export',
  onExport = () => {},
  customActionButtons = [], // Array of { label, onClick, icon, disabled }
  children, // Table and pagination content
  loading = false,
  error = null,
}) {
  // Position dropdown menus using fixed positioning
  useEffect(() => {
    const positionDropdowns = () => {
      const dropdowns = document.querySelectorAll('.kebab-dropdown-card');
      dropdowns.forEach((dropdown) => {
        const trigger = dropdown.previousElementSibling;
        if (trigger) {
          const triggerRect = trigger.getBoundingClientRect();
          
          // Position dropdown to the LEFT of the trigger button
          const dropdownWidth = 110;
          const left = triggerRect.left - dropdownWidth - 8; // 8px gap
          const top = triggerRect.top + window.scrollY;
          
          dropdown.style.position = 'fixed';
          dropdown.style.top = `${top}px`;
          dropdown.style.left = `${left}px`;
        }
      });
    };

    // Position on mount
    setTimeout(positionDropdowns, 0);

    // Reposition on click events
    const handleClick = () => setTimeout(positionDropdowns, 0);
    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', positionDropdowns);
    window.addEventListener('resize', positionDropdowns);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', positionDropdowns);
      window.removeEventListener('resize', positionDropdowns);
    };
  }, []);
  return (
    <div className="dashboard-template">
      {/* ── Header Section ── */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">{title}</h1>
          {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
        </div>
        {actionButtonLabel && (
          <button className="dashboard-action-button" onClick={onActionButtonClick}>
            {actionButtonLabel}
          </button>
        )}
      </div>

      {/* ── KPI Statistics Row ── */}
      {kpiCards.length > 0 && (
        <div className="dashboard-kpi-row">
          {kpiCards.map((card, index) => (
            <div key={index} className="dashboard-kpi-card">
              <span className="dashboard-kpi-label">{card.label}</span>
              <span className="dashboard-kpi-value">{card.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Content Card with Filters ── */}
      <div className="dashboard-content-card">
        {/* ── Content Card Title ── */}
        {contentCardTitle && (
          <h2 className="dashboard-content-card-title">{contentCardTitle}</h2>
        )}

        {/* ── Search and Filter Row ── */}
        <div className="dashboard-filters-row">
          {/* Left: Search Bar */}
          <div className="dashboard-search-wrapper">
            <span className="dashboard-search-icon">🔍</span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              className="dashboard-search-input"
            />
          </div>

          {/* Right: Filters and Export Button */}
          <div className="dashboard-filter-actions">
            {filters.map((filter, index) => {
              const isStatusFilter = filter.label === 'Status' || filter.options.some((option) => option.label === 'Status');
              return isStatusFilter ? (
                <div key={index} className="status-dropdown-wrapper">
                  <select
                    value={filter.value}
                    onChange={filter.onChange}
                    className="dashboard-filter-select status-select"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <select
                  key={index}
                  value={filter.value}
                  onChange={filter.onChange}
                  className="dashboard-filter-select"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              );
            })}
            {customActionButtons.map((btn, index) => (
              <button
                key={index}
                className="dashboard-export-button"
                onClick={btn.onClick}
                disabled={btn.disabled}
                style={{ cursor: btn.disabled ? 'not-allowed' : 'pointer', opacity: btn.disabled ? 0.6 : 1 }}
              >
                {btn.icon && <span style={{ marginRight: '0.25rem' }}>{btn.icon}</span>}
                {btn.label}
              </button>
            ))}
            <button className="dashboard-export-button" onClick={onExport}>
              <span className="export-arrow">↓</span>
              {exportButtonLabel}
            </button>
          </div>
        </div>

        {/* ── Error Message ── */}
        {error && (
          <div className="dashboard-error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* ── Loading State ── */}
        {loading ? (
          <div className="dashboard-loading">Loading...</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
