import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
 
import Login          from "./pages/Login";
import Signup         from "./pages/Signup";
// import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized   from "./pages/Unauthorized";
 
// Booking & Order Intake module
import BookingsList  from "./pages/bookings/BookingsList";
import NewBooking    from "./pages/bookings/NewBooking";
import EditBooking   from "./pages/bookings/EditBooking";
import BookingDetail from "./pages/bookings/BookingDetail";
import ShippersList  from "./pages/bookings/ShippersList";
import NewShipper     from "./pages/bookings/NewShipper";
import ShipperDetail  from "./pages/bookings/ShipperDetail";
import ShipperEdit    from "./pages/bookings/ShipperEdit";
 
// Fleet Management module
import FleetRegistry from "./pages/fleet/FleetRegistry";
import VehicleForm   from "./pages/fleet/VehicleForm";
import VehicleDetail from "./pages/fleet/VehicleDetail";
 
// Route Optimization module
import RouteOptimization from "./pages/routing/RouteOptimization";
import LoadPlanning      from "./pages/routing/LoadPlanning";
import RouteDetail       from "./pages/routing/RouteDetail";
import RouteForm         from "./pages/routing/RouteForm";
import LoadDetail        from "./pages/routing/LoadDetail";
import LoadForm          from "./pages/routing/LoadForm";
import RoutingRules      from "./pages/routing/RoutingRules";
import RoutingRuleDetail from "./pages/routing/RoutingRuleDetail";
import RoutingRuleForm   from "./pages/routing/RoutingRuleForm";
// Exceptions & Claims module
import ExceptionsList  from "./pages/exceptions/ExceptionsList";
import NewException    from "./pages/exceptions/NewException";
import ExceptionDetail from "./pages/exceptions/ExceptionDetail";
import ClaimsList      from "./pages/exceptions/ClaimsList";
import ClaimDetail     from "./pages/exceptions/ClaimDetail";
import NewClaim        from "./pages/exceptions/NewClaim";
 
import AuthProvider    from "./auth/AuthContext";
import ProtectedRoute  from "./auth/ProtectedRoute";
import DashboardRouter from "./pages/DashboardRouter";
 
//Notifications
import Notifications from "./pages/notifications/Notifications";
import UsersPage from "./pages/users/UsersPage";
import Profile from "./pages/users/Profile";
import Dashboard from "./pages/Dashboard";
import AuditLogsPage from "./pages/auditlogs/AuditLogsPage";
import TasksPage from "./pages/tasks/TasksPage";
import NewTaskPage from "./pages/tasks/NewTaskPage";
import TaskDetailPage from "./pages/tasks/TaskDetailPage";
 
 
 
// Dispatch module
import DispatchList   from "./pages/dispatch/DispatchList";
import NewDispatch    from "./pages/dispatch/NewDispatch";
import DispatchDetail from "./pages/dispatch/DispatchDetail";
import DriversList    from "./pages/dispatch/DriversList";
import DriverAckList  from "./pages/dispatch/DriverAckList";
import AcknowledgementDetail from "./pages/dispatch/AcknowledgementDetail";
 
// Manifests & POD module
import ManifestList   from "./pages/manifests/ManifestList";
import NewManifest    from "./pages/manifests/NewManifest";
import ManifestDetail from "./pages/manifests/ManifestDetail";
import PodList        from "./pages/manifests/PodList";
import PodDetail      from "./pages/manifests/PodDetail";
import NewPod         from "./pages/manifests/NewPod";
import HandoverList   from "./pages/manifests/HandoverList";
 
 
// Billing & Reconciliation module
import BillingPanel    from "./pages/billing/BillingPanel";
import InvoicesList    from "./pages/billing/InvoicesList";
import InvoiceCreate   from "./pages/billing/InvoiceCreate";
import InvoiceDetail   from "./pages/billing/InvoiceDetail";
import BillingLinesList from "./pages/billing/BillingLinesList";
import BillingLineCreate from "./pages/billing/BillingLineCreate";
import BillingLinesImport from './pages/billing/BillingLinesImport';
import BillingLinesExport from './pages/billing/BillingLinesExport';
import TariffsList     from "./pages/billing/TariffsList";
import TariffCreate    from "./pages/billing/TariffCreate";
import BillingLineView from "./pages/billing/BillingLineView";
import BillingLineEdit from "./pages/billing/BillingLineEdit";
import TariffView from './pages/billing/TariffView';
import TariffEdit from './pages/billing/TariffEdit';
 
// KPI Reports module
import ReportsPanel    from "./pages/reports/ReportsPanel";
import ReportViewPage from "./pages/reports/ReportViewPage";
import ReportCreatePage from "./pages/reports/ReportCreatePage";
import ReportEditPage from "./pages/reports/ReportEditPage";
import KpiPanel       from "./pages/reports/KpiPanel";
import KpiCreatePage from "./pages/reports/KpiCreatePage";
import KpiDetailPage  from "./pages/reports/KpiDetailPage";
import KpiEditPage    from "./pages/reports/KpiEditPage";
 
 
 
const BOOKING_ROLES_VIEW   = ["Admin", "Dispatcher", "Shipper", "Analyst", "FleetManager", "WarehouseManager", "BillingClerk"];
// Roles allowed to create new bookings
// Backend permits Admin and Shipper to create bookings; Dispatcher must not create.
const BOOKING_ROLES_CREATE = ["Admin", "Shipper"];
// Roles allowed to edit existing bookings
const BOOKING_ROLES_EDIT   = ["Admin", "Shipper", "Dispatcher"];
// Include 'Shipper' so shipper users can view and create their own exceptions/claims
// Roles allowed to VIEW exceptions/claims
const EXCEPTION_VIEW_ROLES = ["Admin", "Dispatcher", "Analyst", "Shipper", "FleetManager", "WarehouseManager", "BillingClerk"];
// Roles allowed to CREATE exceptions (aligned with backend: Shipper and Dispatcher)
const EXCEPTION_CREATE_ROLES = ["Shipper", "Dispatcher"];
// Roles allowed to create claims (Dispatchers must NOT create claims)
const CLAIM_CREATE_ROLES = ["Admin", "Shipper"];
 
 
 
 
const BILLING_ROLES   = ["Admin", "BillingClerk", "Analyst"];
const REPORT_ROLES    = ["Admin", "Analyst"];
 
 
 
 
 
// Roles allowed to access the bookings module
const BOOKING_ROLES = ["Admin", "Dispatcher", "Shipper", "Analyst"];
 
// Roles allowed to access the fleet module
const FLEET_ROLES = ["Admin", "Dispatcher", "FleetManager", "WarehouseManager"];
 
// Roles allowed to access the routing module
const ROUTING_ROLES = ["Admin", "Dispatcher","WarehouseManager", "FleetManager"];
 
 
// Roles allowed to access the dispatch module
const DISPATCH_ROLES   = ["Admin", "Dispatcher", "FleetManager", "WarehouseManager"];
 
// Roles allowed to access the manifests & POD module
const MANIFEST_ROLES   = ["Admin", "Dispatcher", "WarehouseManager", "Analyst", "Driver"];
 
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
 
          {/* ── Dashboard ── */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
 
          {/* ── Booking & Order Intake ── */}
          <Route path="/bookings" element={<ProtectedRoute roles={BOOKING_ROLES_VIEW}><BookingsList /></ProtectedRoute>} />
          <Route path="/bookings/new" element={<ProtectedRoute roles={BOOKING_ROLES_CREATE}><NewBooking /></ProtectedRoute>} />
          <Route path="/bookings/:id/edit" element={<ProtectedRoute roles={BOOKING_ROLES_EDIT}><EditBooking /></ProtectedRoute>} />
          <Route path="/bookings/:id" element={<ProtectedRoute roles={BOOKING_ROLES_VIEW}><BookingDetail /></ProtectedRoute>} />
         
          <Route path="/shippers" element={<ProtectedRoute roles={BOOKING_ROLES_VIEW}><ShippersList /></ProtectedRoute>} />
          <Route path="/shippers/new" element={<ProtectedRoute roles={["Admin"]}><NewShipper /></ProtectedRoute>} />
          <Route path="/shippers/:id/edit" element={<ProtectedRoute roles={["Admin"]}><ShipperEdit /></ProtectedRoute>} />
          <Route path="/shippers/:id" element={<ProtectedRoute roles={BOOKING_ROLES_VIEW}><ShipperDetail /></ProtectedRoute>} />
 
          {/* ── Fleet Management ── */}
          <Route path="/fleet/vehicles" element={<ProtectedRoute roles={FLEET_ROLES}><FleetRegistry /></ProtectedRoute>} />
          <Route path="/fleet/vehicles/new" element={<ProtectedRoute roles={FLEET_ROLES}><VehicleForm isEdit={false} /></ProtectedRoute>} />
          <Route path="/fleet/vehicles/:id" element={<ProtectedRoute roles={FLEET_ROLES}><VehicleDetail /></ProtectedRoute>} />
          <Route path="/fleet/vehicles/:id/edit" element={<ProtectedRoute roles={FLEET_ROLES}><VehicleForm isEdit={true} /></ProtectedRoute>} />
 
          {/* ── Route Optimization ── */}
          <Route path="/routing/routes" element={<ProtectedRoute roles={ROUTING_ROLES}><RouteOptimization /></ProtectedRoute>} />
          <Route path="/routing/routes/new" element={<ProtectedRoute roles={ROUTING_ROLES}><RouteForm isEdit={false} /></ProtectedRoute>} />
          <Route path="/routing/route/:id" element={<ProtectedRoute roles={ROUTING_ROLES}><RouteDetail /></ProtectedRoute>} />
          <Route path="/routing/route/:id/edit" element={<ProtectedRoute roles={ROUTING_ROLES}><RouteForm isEdit={true} /></ProtectedRoute>} />
          <Route path="/routing/load-planning" element={<ProtectedRoute roles={ROUTING_ROLES}><LoadPlanning /></ProtectedRoute>} />
          <Route path="/routing/load/new" element={<ProtectedRoute roles={ROUTING_ROLES}><LoadForm /></ProtectedRoute>} />
          <Route path="/routing/load/:id" element={<ProtectedRoute roles={ROUTING_ROLES}><LoadDetail /></ProtectedRoute>} />
          <Route path="/routing/load/:id/edit" element={<ProtectedRoute roles={ROUTING_ROLES}><LoadForm isEdit={true} /></ProtectedRoute>} />
 
          <Route path="/routing/rules" element={<ProtectedRoute roles={ROUTING_ROLES}><RoutingRules /></ProtectedRoute>} />
          <Route path="/routing/rules/new" element={<ProtectedRoute roles={ROUTING_ROLES}><RoutingRuleForm /></ProtectedRoute>} />
          <Route path="/routing/rules/:id" element={<ProtectedRoute roles={ROUTING_ROLES}><RoutingRuleDetail /></ProtectedRoute>} />
 
          {/* ── Exceptions & Claims ── */}
          <Route path="/exceptions" element={<ProtectedRoute roles={EXCEPTION_VIEW_ROLES}><ExceptionsList /></ProtectedRoute>} />
          <Route path="/exceptions/new" element={<ProtectedRoute roles={EXCEPTION_CREATE_ROLES}><NewException /></ProtectedRoute>} />
          <Route path="/exceptions/:id" element={<ProtectedRoute roles={EXCEPTION_VIEW_ROLES}><ExceptionDetail /></ProtectedRoute>} />
          <Route path="/claims" element={<ProtectedRoute roles={EXCEPTION_VIEW_ROLES}><ClaimsList /></ProtectedRoute>} />
          <Route path="/claims/new" element={<ProtectedRoute roles={CLAIM_CREATE_ROLES}><NewClaim /></ProtectedRoute>} />
          <Route path="/claims/:id" element={<ProtectedRoute roles={EXCEPTION_VIEW_ROLES}><ClaimDetail /></ProtectedRoute>} />
 
          {/* ── Management & Profile ── */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
         
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/tasks/new" element={<ProtectedRoute><NewTaskPage /></ProtectedRoute>} />
          <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
 
 
          {/* ── Dispatch & Drivers ── */}
          <Route
            path="/dispatch"
            element={
              <ProtectedRoute roles={[...DISPATCH_ROLES, 'WarehouseManager']}>
                <DispatchList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispatch/new"
            element={
              <ProtectedRoute roles={DISPATCH_ROLES}>
                <NewDispatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispatch/:id"
            element={
              <ProtectedRoute roles={DISPATCH_ROLES}>
                <DispatchDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers"
            element={
              <ProtectedRoute roles={DISPATCH_ROLES}>
                <DriversList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-ack"
            element={
              <ProtectedRoute roles={[...DISPATCH_ROLES, 'Driver']}>
                <DriverAckList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/acknowledgement/:id"
            element={
              <ProtectedRoute roles={[...DISPATCH_ROLES, 'Driver']}>
                <AcknowledgementDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/acknowledgements"
            element={
              <ProtectedRoute roles={[...DISPATCH_ROLES, 'Driver']}>
                <DriverAckList />
              </ProtectedRoute>
            }
          />
 
          {/* ── Manifests & POD ── */}
          <Route
            path="/manifests"
            element={
              <ProtectedRoute roles={MANIFEST_ROLES}>
                <ManifestList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manifests/new"
            element={
              <ProtectedRoute roles={MANIFEST_ROLES}>
                <NewManifest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manifests/:id"
            element={
              <ProtectedRoute roles={MANIFEST_ROLES}>
                <ManifestDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manifests/pods"
            element={
              <ProtectedRoute roles={MANIFEST_ROLES}>
                <PodList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manifests/pods/:id"
            element={
              <ProtectedRoute roles={MANIFEST_ROLES}>
                <PodDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manifests/pods/:id/edit"
            element={
              <ProtectedRoute roles={MANIFEST_ROLES}>
                <PodDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pod"
            element={
              <ProtectedRoute roles={MANIFEST_ROLES}>
                <PodList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pod/new"
            element={
              <ProtectedRoute roles={MANIFEST_ROLES}>
                <NewPod />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pod/:id"
            element={
              <ProtectedRoute roles={[...MANIFEST_ROLES,'Driver']}>
                <PodDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pod/:id/edit"
            element={
              <ProtectedRoute roles={MANIFEST_ROLES}>
                <PodDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handovers"
            element={
              <ProtectedRoute roles={MANIFEST_ROLES}>
                <HandoverList />
              </ProtectedRoute>
            }
          />
 
 
 
          {/* ── Billing & Reconciliation ── */}
          <Route
            path="/billing"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <BillingPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/invoices"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <InvoicesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/invoices/create"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <InvoiceCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/invoices/:id"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <InvoiceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/billing-lines"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <BillingLinesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/billing-lines/create"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <BillingLineCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/billing-lines/import"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <BillingLinesImport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/billing-lines/export"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <BillingLinesExport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/billing-lines/view/:id"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <BillingLineView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/billing-lines/edit/:id"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <BillingLineEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/tariffs"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <TariffsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/tariffs/create"
            element={
              <ProtectedRoute roles={BILLING_ROLES}>
                <TariffCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/tariffs/view/:id"
            element={<TariffView />}
          />
          <Route
            path="/billing/tariffs/edit/:id"
            element={<TariffEdit />}
          />
 
 
          {/* -- KPI Reports -- */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={REPORT_ROLES}>
                <ReportsPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/create"
            element={
              <ProtectedRoute roles={REPORT_ROLES}>
                <ReportCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id/edit"
            element={
              <ProtectedRoute roles={REPORT_ROLES}>
                <ReportEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute roles={REPORT_ROLES}>
                <ReportViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kpis"
            element={
              <ProtectedRoute roles={REPORT_ROLES}>
                <KpiPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kpis/create"
            element={
              <ProtectedRoute roles={REPORT_ROLES}>
                <KpiCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kpis/:id"
            element={
              <ProtectedRoute roles={REPORT_ROLES}>
                <KpiDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kpis/edit/:id"
            element={
              <ProtectedRoute roles={REPORT_ROLES}>
                <KpiEditPage />
              </ProtectedRoute>
            }
          />
 
          {/* ── Admin Only ── */}
          <Route path="/admin/users" element={<ProtectedRoute role="Admin"><UsersPage /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute role="Admin"><AuditLogsPage /></ProtectedRoute>} />
         
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
 