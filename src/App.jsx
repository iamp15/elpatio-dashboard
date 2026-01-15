import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transacciones from './pages/Transacciones'
import Configuracion from './pages/Configuracion'
import MainLayout from './components/layout/MainLayout'
import { isAuthenticated } from './services/auth'
import webSocketService from './services/websocket'

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function App() {
  useEffect(() => {
    // Conectar WebSocket si está autenticado
    // No desconectamos aquí porque queremos mantener la conexión activa
    // mientras el usuario esté autenticado
    if (isAuthenticated() && !webSocketService.getConnectionState().isConnected) {
      webSocketService.connect()
    }

    // No desconectamos aquí - dejamos que se desconecte solo al cerrar sesión
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transacciones" element={<Transacciones />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
