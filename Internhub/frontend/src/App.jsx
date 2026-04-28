import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/shared/Sidebar'
import { LoginPage, SignupPage } from './components/auth/AuthPages'
import { AnalyticsPage, TasksPage, ReportsPage, InternsPage, InternshipsPage } from './pages/Pages'
import { Spinner } from './components/shared/UI'
import './index.css'

function Guard({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner/></div>
  if (!user)   return <Navigate to="/login" replace/>
  if (roles && !roles.includes(user.role)) return <Navigate to="/analytics" replace/>
  return children
}

function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar/>
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right"/>
        <Routes>
          <Route path="/login"  element={<LoginPage/>}/>
          <Route path="/signup" element={<SignupPage/>}/>
          <Route path="/analytics"   element={<Guard><Layout><AnalyticsPage/></Layout></Guard>}/>
          <Route path="/tasks"       element={<Guard><Layout><TasksPage/></Layout></Guard>}/>
          <Route path="/reports"     element={<Guard><Layout><ReportsPage/></Layout></Guard>}/>
          <Route path="/interns"     element={<Guard roles={['admin','mentor']}><Layout><InternsPage/></Layout></Guard>}/>
          <Route path="/internships" element={<Guard roles={['admin']}><Layout><InternshipsPage/></Layout></Guard>}/>
          <Route path="*"            element={<Navigate to="/analytics" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
