/**
 * Componente para mostrar la lista de admins
 */

import { useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmins } from '../../hooks/useAdmins'
import { usePermisos } from '../../hooks/usePermisos'
import LoadingSpinner from '../ui/LoadingSpinner'
import Badge from '../ui/Badge'
import ConfirmarEliminarAdmin from './ConfirmarEliminarAdmin'
import './AdminsLista.css'

/**
 * Obtener variante del badge según estado del admin
 */
const getEstadoBadgeVariant = (estado) => {
  switch (estado) {
    case 'activo':
      return 'success'
    case 'inactivo':
      return 'warning'
    default:
      return 'default'
  }
}

/**
 * Formatear estado para mostrar
 */
const formatEstado = (estado) => {
  const estados = {
    activo: 'Activo',
    inactivo: 'Inactivo',
  }
  return estados[estado] || estado
}

/**
 * Formatear rol para mostrar
 */
const formatRol = (rol) => {
  const roles = {
    admin: 'Admin',
    superadmin: 'Superadmin',
    bot: 'Bot',
  }
  return roles[rol] || rol
}

/**
 * Obtener variante del badge según rol
 */
const getRolBadgeVariant = (rol) => {
  switch (rol) {
    case 'superadmin':
      return 'danger'
    case 'admin':
      return 'primary'
    case 'bot':
      return 'default'
    default:
      return 'default'
  }
}

function AdminsLista() {
  const navigate = useNavigate()
  const { admins, loading, error, refetch, eliminarAdmin } = useAdmins()
  const { tienePermiso } = usePermisos()
  const [eliminando, setEliminando] = useState(null)
  const [adminExpandido, setAdminExpandido] = useState(null)
  const [adminAEliminar, setAdminAEliminar] = useState(null)
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')

  const handleEditar = (adminId) => {
    navigate(`/administracion/admins/editar/${adminId}`)
  }

  const handleEliminarClick = (admin) => {
    setAdminAEliminar(admin)
    setMostrarModalEliminar(true)
  }

  const handleConfirmarEliminar = async () => {
    if (!adminAEliminar) return

    setEliminando(adminAEliminar._id)
    const resultado = await eliminarAdmin(adminAEliminar._id)
    setEliminando(null)

    if (!resultado.success) {
      alert(`Error al eliminar: ${resultado.error}`)
    } else {
      setMostrarModalEliminar(false)
      const nombreEliminado = adminAEliminar.nombreCompleto
      setAdminAEliminar(null)
      setMensajeExito(`Admin "${nombreEliminado}" eliminado exitosamente`)
      setTimeout(() => {
        setMensajeExito('')
      }, 5000)
    }
  }

  const toggleExpandir = (id) => {
    setAdminExpandido(adminExpandido === id ? null : id)
  }

  if (loading) {
    return (
      <div className="admins-lista-loading">
        <LoadingSpinner />
        <p>Cargando admins...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admins-lista-error">
        <p>Error al cargar admins: {error}</p>
        <button onClick={refetch} className="btn-retry">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="admins-lista">
      <div className="lista-header">
        <div className="lista-header-left">
          <h3>Lista de Admins</h3>
          <span className="lista-count">{admins.length} admins</span>
        </div>
        <div className="lista-header-right">
          {tienePermiso('ADMINS_CREAR') && (
            <button onClick={() => navigate('/administracion/admins/crear')} className="btn-crear">
              ➕ Crear Admin
            </button>
          )}
          <button onClick={refetch} className="btn-refresh" title="Actualizar lista">
            🔄
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div className="mensaje-exito-lista">
          <span>✅ {mensajeExito}</span>
          <button 
            className="btn-cerrar-mensaje"
            onClick={() => setMensajeExito('')}
            title="Cerrar"
          >
            ✕
          </button>
        </div>
      )}

      {admins.length === 0 ? (
        <div className="lista-vacia">
          <p>No hay admins registrados</p>
        </div>
      ) : (
        <div className="lista-tabla-container">
          <table className="lista-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <Fragment key={admin._id}>
                  <tr className={adminExpandido === admin._id ? 'fila-expandida' : ''}>
                    <td className="celda-nombre">
                      <div className="nombre-container">
                        <div className="admin-avatar-placeholder">
                          {admin.nombreCompleto.charAt(0).toUpperCase()}
                        </div>
                        <span>{admin.nombreCompleto}</span>
                      </div>
                    </td>
                    <td>{admin.email}</td>
                    <td>
                      <Badge variant={getRolBadgeVariant(admin.rol)}>
                        {formatRol(admin.rol)}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={getEstadoBadgeVariant(admin.estado)}>
                        {formatEstado(admin.estado)}
                      </Badge>
                    </td>
                    <td className="celda-acciones">
                      <button
                        className="btn-accion btn-ver"
                        onClick={() => toggleExpandir(admin._id)}
                        title="Ver detalles"
                      >
                        {adminExpandido === admin._id ? '▲' : '▼'}
                      </button>
                      {tienePermiso('ADMINS_MODIFICAR') && (
                        <button
                          className="btn-accion btn-editar"
                          onClick={() => handleEditar(admin._id)}
                          title="Editar admin"
                        >
                          ✏️
                        </button>
                      )}
                      {tienePermiso('ADMINS_ELIMINAR') && (
                        <button
                          className="btn-accion btn-eliminar"
                          onClick={() => handleEliminarClick(admin)}
                          disabled={eliminando === admin._id}
                          title="Eliminar admin"
                        >
                          {eliminando === admin._id ? '...' : '🗑️'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {adminExpandido === admin._id && (
                    <tr className="fila-detalles">
                      <td colSpan="5">
                        <div className="detalles-container">
                          <div className="detalle-grupo">
                            <h4>Información Adicional</h4>
                            <div className="detalle-grid">
                              <div className="detalle-item">
                                <span className="detalle-label">ID:</span>
                                <span className="detalle-value detalle-mono">{admin._id}</span>
                              </div>
                              {admin.fechaCreacion && (
                                <div className="detalle-item">
                                  <span className="detalle-label">Fecha de Creación:</span>
                                  <span className="detalle-value">
                                    {new Date(admin.fechaCreacion).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmarEliminarAdmin
        isOpen={mostrarModalEliminar}
        onClose={() => {
          setMostrarModalEliminar(false)
          setAdminAEliminar(null)
        }}
        admin={adminAEliminar}
        onConfirm={handleConfirmarEliminar}
        eliminando={eliminando === adminAEliminar?._id}
      />
    </div>
  )
}

export default AdminsLista
