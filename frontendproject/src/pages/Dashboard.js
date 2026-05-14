import React from 'react';
import Layout from '../components/Layout';
import RecentAuditLogs from '../components/RecentAuditLogs';
import '../styles/Dashboard.css';

export default function Dashboard() {
  // Sample data for KPI cards
  const kpiCards = [
    {
      id: 1,
      title: 'Total Bookings',
      value: '72',
      trend: '+12%',
      period: 'vs last 7 days',
      icon: '📦',
      highlighted: true,
      trendColor: 'positive',
    },
    {
      id: 2,
      title: 'Active Users',
      value: '14',
      trend: '+7%',
      period: 'vs last 7 days',
      icon: '👥',
      trendColor: 'positive',
    },
    {
      id: 3,
      title: 'Dispatches',
      value: '1',
      trend: '-50%',
      period: 'vs last 7 days',
      icon: '🚚',
      trendColor: 'negative',
    },
    {
      id: 4,
      title: 'Audit Events',
      value: '111',
      trend: '+15%',
      period: 'vs last 7 days',
      icon: '🔍',
      trendColor: 'positive',
    },
    {
      id: 5,
      title: 'Reports Generated',
      value: '0',
      trend: '—',
      period: 'No change',
      icon: '📊',
      trendColor: 'neutral',
    },
  ];

  return (
    <Layout>
      <div className="dashboard-page">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div>
            <h1 className="dashboard-title">Welcome back, Ria! 👋</h1>
            <p className="dashboard-subtitle">
              Here's an overview of your operations today.
            </p>
          </div>
        </div>

        {/* KPI Cards Section */}
        <div className="dashboard-kpi-grid">
          {kpiCards.map((card) => (
            <div
              key={card.id}
              className={`kpi-card ${card.highlighted ? 'kpi-card-highlighted' : ''} trend-${card.trendColor}`}
            >
              <div className="kpi-card-header">
                <h3 className="kpi-card-title">{card.title}</h3>
                <span className="kpi-card-icon">{card.icon}</span>
              </div>
              <div className="kpi-card-value">{card.value}</div>
              <div className="kpi-card-trend">
                <span className={`trend-badge trend-${card.trendColor}`}>
                  {card.trend}
                </span>
                <span className="trend-period">{card.period}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Content Section */}
        <div className="dashboard-content-grid">
          {/* Left: Charts */}
          <div className="dashboard-charts-section">
            {/* Bookings Over Time Chart */}
            <div className="dashboard-chart-card">
              <div className="chart-header">
                <h3>Bookings Over Time</h3>
                <select className="chart-timeframe">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
              <div className="chart-placeholder chart-line">
                <div className="chart-mock-line"></div>
              </div>
            </div>

            {/* Dispatch Activity Chart */}
            <div className="dashboard-chart-card">
              <div className="chart-header">
                <h3>Dispatch Activity</h3>
                <select className="chart-timeframe">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
              <div className="chart-placeholder chart-bar">
                <div className="chart-mock-bars">
                  <div className="bar" style={{ height: '70%' }}></div>
                  <div className="bar" style={{ height: '45%' }}></div>
                  <div className="bar" style={{ height: '60%' }}></div>
                  <div className="bar" style={{ height: '80%' }}></div>
                  <div className="bar" style={{ height: '50%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Recent Events and Reports */}
          <div className="dashboard-sidebar-section">
            {/* Recent Audit Logs - Dynamic Component */}
            <RecentAuditLogs />

            {/* Reports Overview */}
            <div className="dashboard-reports-card">
              <div className="reports-empty-state">
                <div className="reports-icon">📋</div>
                <h4>No reports generated yet</h4>
                <p>Once reports are generated, they will appear here.</p>
                <button className="btn-generate-report">
                  + Generate New Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
