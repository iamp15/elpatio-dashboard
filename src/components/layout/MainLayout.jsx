import { Outlet, Link, useNavigate } from 'react-router-dom'
import { logout, isAuthenticated } from '../../services/auth'
import './MainLayout.css'

function MainLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated()) {
    navigate('/login')
    return null
  }

  return (
    <div className="main-layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🏠 El Patio</h1>
          <nav className="nav">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/transacciones" className="nav-link">Transacciones</Link>
            <Link to="/configuracion" className="nav-link">Configuración</Link>
          </nav>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
