import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import SimpleDashboard from './dashboards/SimpleDashboard';

export default function DashboardRouter() {
  const { user } = useContext(AuthContext);
  const role = user?.role || '';

  switch (role.toLowerCase()) {
    case 'admin':
      return <AdminDashboard />;
    default:
      return <SimpleDashboard />;
  }
}
