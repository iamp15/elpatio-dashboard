/**
 * Componente de navegación principal del dashboard
 * Incluye el logo y los enlaces de navegación
 */

import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

/**
 * Enlaces de navegación del dashboard
 */
const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/transacciones', label: 'Transacciones' },
  { path: '/administracion', label: 'Administración' },
  { path: '/configuracion', label: 'Configuración' },
]

function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-logo">
        🏠 El Patio
      </Link>
      
      <div className="navbar-links">
        {NAV_LINKS.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`nav-link ${location.pathname === path ? 'nav-link-active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default Navbar
