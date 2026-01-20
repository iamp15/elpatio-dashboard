import { Outlet, Link, useNavigate } from 'react-router-dom'
import { logout, isAuthenticated, getUserInfo } from '../../services/auth'
import { formatRole, getRoleBadgeVariant } from '../../utils/formatters'
import Badge from '../ui/Badge'
import './MainLayout.css'

function MainLayout() {
  const navigate = useNavigate()
  const userInfo = getUserInfo()

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
          <div className="header-left">
            <h1 className="logo">🏠 El Patio</h1>
            {userInfo && (
              <div className="user-info">
                <span className="user-email">{userInfo.email}</span>
                <Badge variant={getRoleBadgeVariant(userInfo.rol)}>
                  {formatRole(userInfo.rol)}
                </Badge>
              </div>
            )}
          </div>
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
