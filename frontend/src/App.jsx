import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ModulePage from './pages/ModulePage'
import Training from './pages/Training'
import Debugging from './pages/Debugging'
import Diagnostic from './pages/Diagnostic'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DiagnosticGate from './components/auth/DiagnosticGate'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/diagnostic"
          element={
            <ProtectedRoute>
              <Diagnostic />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DiagnosticGate>
                <Dashboard />
              </DiagnosticGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/module/:id"
          element={
            <ProtectedRoute>
              <ModulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training"
          element={
            <ProtectedRoute>
              <Training />
            </ProtectedRoute>
          }
        />
        <Route
          path="/debugging"
          element={
            <ProtectedRoute>
              <Debugging />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
