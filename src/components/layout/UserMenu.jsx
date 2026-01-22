/**
 * Componente de menú de usuario estilo Google
 * Muestra un dropdown con información del usuario y opciones
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../services/auth'
import { formatRole } from '../../utils/formatters'
import './UserMenu.css'

/**
 * Obtiene el primer nombre del nombre completo
 */
const getFirstName = (nombreCompleto) => {
  if (!nombreCompleto) return ''
  return nombreCompleto.split(' ')[0]
}

/**
 * Obtiene las iniciales del nombre
 */
const getInitials = (nombreCompleto) => {
  if (!nombreCompleto) return '?'
  const nombres = nombreCompleto.split(' ')
  if (nombres.length >= 2) {
    return `${nombres[0].charAt(0)}${nombres[1].charAt(0)}`.toUpperCase()
  }
  return nombreCompleto.charAt(0).toUpperCase()
}

/**
 * Menú de usuario con dropdown
 * @param {Object} perfil - Información del perfil desde usePerfil()
 */
function UserMenu({ perfil }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cerrar menú al presionar Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleViewProfile = () => {
    setIsOpen(false)
    navigate('/perfil')
  }

  const handleLogout = () => {
    setIsOpen(false)
    logout()
    navigate('/login')
  }

  if (!perfil) return null

  return (
    <div className="user-menu" ref={menuRef}>
      {/* Trigger - Cuadro de info usuario */}
      <button 
        className="user-menu-trigger"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="user-menu-name">{getFirstName(perfil.nombreCompleto)}</span>
        <span className="user-menu-role">{formatRole(perfil.rol)}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="user-menu-dropdown">
          {/* Header del dropdown con avatar e info */}
          <div className="user-menu-header">
            <div className="user-menu-avatar">
              {getInitials(perfil.nombreCompleto)}
            </div>
            <div className="user-menu-info">
              <span className="user-menu-fullname">{perfil.nombreCompleto}</span>
              <span className="user-menu-email">{perfil.email}</span>
              <span className="user-menu-role-badge">{formatRole(perfil.rol)}</span>
            </div>
          </div>

          {/* Separador */}
          <div className="user-menu-divider"></div>

          {/* Acciones */}
          <div className="user-menu-actions">
            <button className="user-menu-action" onClick={handleViewProfile}>
              <span className="user-menu-action-icon">👤</span>
              Ver perfil
            </button>
            <button className="user-menu-action user-menu-action-logout" onClick={handleLogout}>
              <span className="user-menu-action-icon">🚪</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
