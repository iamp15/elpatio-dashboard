/**
 * Página de Administración
 * Centro de control para gestión de admins y cajeros
 * Usa rutas anidadas para cada sección
 */

import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { usePermisos } from '../hooks/usePermisos'
import AdminsLista from '../components/administracion/AdminsLista'
import AdminsCrear from '../components/administracion/AdminsCrear'
import AdminsEditar from '../components/administracion/AdminsEditar'
import CajerosLista from '../components/administracion/CajerosLista'
import CajerosCrear from '../components/administracion/CajerosCrear'
import CajerosEditar from '../components/administracion/CajerosEditar'
import './Administracion.css'

/**
 * Tabs disponibles en la sección de administración
 * Cada tab tiene un permiso asociado para control de acceso
 */
const TABS = [
  { id: 'admins', label: 'Admins', icon: '👑', permiso: 'ADMINS_SECCION', path: '/administracion/admins' },
  { id: 'cajeros', label: 'Cajeros', icon: '💼', permiso: 'CAJEROS_SECCION', path: '/administracion/cajeros' },
]

/**
 * Componente de layout para las páginas de administración
 */
function AdministracionLayout({ children }) {
  const { tienePermiso } = usePermisos()
  const location = useLocation()
  
  const tabsDisponibles = TABS.filter(tab => tienePermiso(tab.permiso))

  if (tabsDisponibles.length === 0) {
    return (
      <div className="administracion-page">
        <div className="administracion-header">
          <h1>Administración</h1>
        </div>
        <div className="no-permissions">
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="administracion-page">
      <div className="administracion-header">
        <h1>Administración</h1>
        <p className="page-subtitle">
          Gestión de usuarios del sistema
        </p>
      </div>

      {/* Tabs de navegación */}
      {tabsDisponibles.length > 1 && (
        <div className="administracion-tabs">
          {tabsDisponibles.map(({ id, label, icon, path }) => {
            // Determinar si el tab está activo basándose en la ruta actual
            const isActive = location.pathname.startsWith(path)
            return (
              <Link
                key={id}
                to={path}
                className={`administracion-tab ${isActive ? 'administracion-tab-active' : ''}`}
              >
                <span className="tab-icon">{icon}</span>
                {label}
              </Link>
            )
          })}
        </div>
      )}

      {/* Contenido de las rutas */}
      <div className="administracion-content">
        {children}
      </div>
    </div>
  )
}

function Administracion() {
  const { tienePermiso } = usePermisos()
  
  const tabsDisponibles = TABS.filter(tab => tienePermiso(tab.permiso))

  // Si no hay permisos, redirigir al dashboard
  if (tabsDisponibles.length === 0) {
    return <Navigate to="/dashboard" replace />
  }

  // Redirigir desde /administracion a la primera sección disponible
  const primeraSeccion = tabsDisponibles[0]?.path

  return (
    <Routes>
      <Route path="/" element={<AdministracionLayout><Navigate to={primeraSeccion || '/dashboard'} replace /></AdministracionLayout>} />
      
      {/* Rutas de Cajeros */}
      <Route path="cajeros" element={<AdministracionLayout><CajerosLista /></AdministracionLayout>} />
      <Route path="cajeros/crear" element={<AdministracionLayout><CajerosCrear /></AdministracionLayout>} />
      <Route path="cajeros/editar/:id" element={<AdministracionLayout><CajerosEditar /></AdministracionLayout>} />
      
      {/* Rutas de Admins */}
      <Route path="admins" element={<AdministracionLayout><AdminsLista /></AdministracionLayout>} />
      <Route path="admins/crear" element={<AdministracionLayout><AdminsCrear /></AdministracionLayout>} />
      <Route path="admins/editar/:id" element={<AdministracionLayout><AdminsEditar /></AdministracionLayout>} />
      
      {/* Catch all - redirigir a la primera sección */}
      <Route path="*" element={<Navigate to={primeraSeccion || '/dashboard'} replace />} />
    </Routes>
  )
}

export default Administracion
