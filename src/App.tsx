import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/Auth/LoginPage'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/Auth/RegisterPage'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import PublicRoute from './routes/PublicRoute'
import CustomerDashboard from './pages/Customer/CustomerDashboard'
import CustomerProtectedRoute from './routes/CustomerProtectedRoute'
import VehiclesPage from './pages/Customer/Vehicles'
import AppointmentsPage from './pages/Customer/Appointments'
import NotificationsPage from './pages/Customer/Notifications'
import ReviewsPage from './pages/Customer/Reviews'
import PartRequestsPage from './pages/Customer/PartRequests'
import PartsSalesPage from './pages/Customer/PartsSales'
import CustomerInvoiceDetailsPage from './pages/Customer/InvoiceDetails'
import { Toaster } from 'sonner'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminProtectedRoute from './routes/AdminProtectedRoute'
import PartsPage from './pages/Admin/Parts'
import VendorsPage from './pages/Admin/Vendors'
import PurchaseInvoicesPage from './pages/Admin/PurchaseInvoices'
import AdminAppointmentsPage from './pages/Admin/Appointments'
import AdminSalesOrdersPage from './pages/Admin/SalesOrders'
import AdminReviewsPage from './pages/Admin/Reviews'
import AdminReportsPage from './pages/Admin/Reports'
import StaffDashboard from './pages/Staff/StaffDashboard'
import StaffProtectedRoute from './routes/StaffProtectedRoute'
import StaffCustomerRegistration from './pages/Staff/StaffCustomerRegistration'
import StaffRegistrationPage from './pages/Admin/StaffRegistration'
import StaffCustomersPage from './pages/Staff/StaffCustomers'
import StaffAppointmentsPage from './pages/Staff/Appointments'
import StaffSalesPage from './pages/Staff/Sales'
import StaffSalesOrdersPage from './pages/Staff/SalesOrders'
import StaffPartRequestsPage from './pages/Staff/PartRequests'
import AdminPartRequestsPage from './pages/Admin/PartRequests'

function App() {

  const { checkAuth, checking, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  console.log(user);

  if (checking) {
    return (
      <>
        <div className="h-screen flex items-center justify-center bg-background">
          <Loader2 className="animate-spin" size={40} />
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position='top-center' style={{ display: 'flex', justifyContent: 'center' }} toastOptions={{
        style: {
          width: 'fit-content',
        },
      }} />
      <Routes>
        <Route path='/' element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/customer/dashboard"
          element={
            <CustomerProtectedRoute>
              <CustomerDashboard />
            </CustomerProtectedRoute>
          } />

        <Route
          path="/customer/vehicles"
          element={
            <CustomerProtectedRoute>
              <VehiclesPage />
            </CustomerProtectedRoute>
          } />

        <Route
          path="/customer/appointments"
          element={
            <CustomerProtectedRoute>
              <AppointmentsPage />
            </CustomerProtectedRoute>
          } />

        <Route
          path="/customer/parts"
          element={
            <CustomerProtectedRoute>
              <PartsSalesPage />
            </CustomerProtectedRoute>
          } />

        <Route
          path="/customer/invoices/:id"
          element={
            <CustomerProtectedRoute>
              <CustomerInvoiceDetailsPage />
            </CustomerProtectedRoute>
          } />

        <Route
          path="/customer/notifications"
          element={
            <CustomerProtectedRoute>
              <NotificationsPage />
            </CustomerProtectedRoute>
          } />

        <Route
          path="/customer/reviews"
          element={
            <CustomerProtectedRoute>
              <ReviewsPage />
            </CustomerProtectedRoute>
          } />

        <Route
          path="/customer/part-requests"
          element={
            <CustomerProtectedRoute>
              <PartRequestsPage />
            </CustomerProtectedRoute>
          } />

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
        <Route
          path="/admin/parts"
          element={
            <AdminProtectedRoute>
              <PartsPage />
            </AdminProtectedRoute>
          } />
          <Route
            path="/admin/vendors"
            element={
              <AdminProtectedRoute>
                <VendorsPage />
              </AdminProtectedRoute>
            } />
        <Route
          path="/admin/purchase-invoices"
          element={
            <AdminProtectedRoute>
              <PurchaseInvoicesPage />
            </AdminProtectedRoute>
          } />
        <Route
          path="/admin/sales-orders"
          element={
            <AdminProtectedRoute>
              <AdminSalesOrdersPage />
            </AdminProtectedRoute>
          } />
        <Route
          path="/admin/appointments"
          element={
            <AdminProtectedRoute>
              <AdminAppointmentsPage />
            </AdminProtectedRoute>
          } />
        <Route
          path="/admin/part-requests"
          element={
            <AdminProtectedRoute>
              <AdminPartRequestsPage />
            </AdminProtectedRoute>
          } />
        <Route
          path="/admin/reviews"
          element={
            <AdminProtectedRoute>
              <AdminReviewsPage />
            </AdminProtectedRoute>
          } />
        <Route
          path="/admin/reports"
          element={
            <AdminProtectedRoute>
              <AdminReportsPage />
            </AdminProtectedRoute>
          } />
        <Route
          path="/admin/staff"
          element={
            <AdminProtectedRoute>
              <StaffRegistrationPage />
            </AdminProtectedRoute>
          } />
        <Route
          path="/staff/dashboard"
          element={
            <StaffProtectedRoute>
              <StaffDashboard />
            </StaffProtectedRoute>
          } />
        <Route
          path="/staff/customers/register"
          element={
            <StaffProtectedRoute>
              <StaffCustomerRegistration />
            </StaffProtectedRoute>
          } />
        <Route
          path="/staff/customers"
          element={
            <StaffProtectedRoute>
              <StaffCustomersPage />
            </StaffProtectedRoute>
          } />
        <Route
          path="/staff/appointments"
          element={
            <StaffProtectedRoute>
              <StaffAppointmentsPage />
            </StaffProtectedRoute>
          } />
        <Route
          path="/staff/sales"
          element={
            <StaffProtectedRoute>
              <StaffSalesPage />
            </StaffProtectedRoute>
          } />
        <Route
          path="/staff/sales-orders"
          element={
            <StaffProtectedRoute>
              <StaffSalesOrdersPage />
            </StaffProtectedRoute>
          } />
        <Route
          path="/staff/part-requests"
          element={
            <StaffProtectedRoute>
              <StaffPartRequestsPage />
            </StaffProtectedRoute>
          } />
      </Routes>
    </>
  )
}

export default App
