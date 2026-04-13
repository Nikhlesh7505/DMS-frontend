import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import ChatBot from './pages/chatBot/ChatBot'

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ResponderDashboard from './pages/dashboard/ResponderDashboard'
import CitizenDashboard from './pages/dashboard/CitizenDashboard'

// Management Pages
import Disasters from './pages/disasters/Disasters'
import DisasterDetail from './pages/disasters/DisasterDetail'
import Alerts from './pages/alerts/Alerts'
import AlertDetail from './pages/alerts/AlertDetail'
import EmergencyRequests from './pages/emergency/EmergencyRequests'
import Resources from './pages/resources/Resources'
import RescueTasks from './pages/tasks/RescueTasks'
import Users from './pages/users/Users'
import MyAlerts from './pages/users/MyAlerts'
import Weather from './pages/weather/Weather'
import Profile from './pages/profile/Profile'
import Donation from './pages/donation/Donation'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Role-based Dashboard Redirect
const Dashboard = () => {
  const { user } = useAuth()

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />
    case 'ngo':
    case 'rescue_team':
      return <ResponderDashboard />
    case 'citizen':
      return <CitizenDashboard />
    default:
      return <CitizenDashboard />
  }
}

const AlertsPage = () => {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <Alerts />
  }

  return <MyAlerts />
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        
        {/* Admin Only */}
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        } />
        
        {/* Admin and Responder */}
        <Route path="disasters" element={
          <ProtectedRoute allowedRoles={['admin', 'ngo', 'rescue_team', 'citizen']}>
            <Disasters />
          </ProtectedRoute>
        } />
        <Route path="disasters/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'ngo', 'rescue_team', 'citizen']}>
            <DisasterDetail />
          </ProtectedRoute>
        } />
        
        {/* All Authenticated */}
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="alerts/:id" element={<AlertDetail />} />
        <Route path="emergency" element={<EmergencyRequests />} />
        <Route path="resources" element={<Resources />} />
        <Route path="tasks" element={<RescueTasks />} />
        <Route path="weather" element={<Weather />} />
        <Route path="profile" element={<Profile />} />
        <Route path="chatbot" element={<ChatBot />} />
        <Route path="donation" element={<Donation/>}/>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
