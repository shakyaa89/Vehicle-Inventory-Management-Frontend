import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/Auth/LoginPage'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/Auth/RegisterPage'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import PublicRoute from './routes/PublicRoute'

function App() {

  const { checkAuth, checking, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
    <Toaster />
    <Routes>
      <Route path='/' element={<LandingPage/>} />
    
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
    </Routes>
    </>
  )
}

export default App
