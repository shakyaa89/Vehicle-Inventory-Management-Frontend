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
import { Toaster } from 'sonner'

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
      </Routes>
    </>
  )
}

export default App
