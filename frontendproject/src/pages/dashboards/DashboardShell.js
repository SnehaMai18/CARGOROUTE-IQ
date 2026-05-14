import Layout from '../../components/Layout';
import '../../styles/Dashboard.css';

export default function DashboardShell({ title, description, actions, children }) {
  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-page-header">
          <div>
            <h1>{title}</h1>
            {description && <p className="dashboard-subtitle">{description}</p>}
          </div>
          {actions && <div className="dashboard-actions">{actions}</div>}
        </div>
        {children}
      </div>
    </Layout>
  );
}
