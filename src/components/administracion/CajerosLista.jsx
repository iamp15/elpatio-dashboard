/**
 * Componente para mostrar la lista de cajeros
 */

import { useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCajeros } from '../../hooks/useCajeros'
import { usePermisos } from '../../hooks/usePermisos'
import LoadingSpinner from '../ui/LoadingSpinner'
import Badge from '../ui/Badge'
import ConfirmarEliminarCajero from './ConfirmarEliminarCajero'
import './CajerosLista.css'

/**
 * Validar si una URL de imagen es válida y no es de prueba
 */
const esUrlImagenValida = (url) => {
  if (!url) return false
  // Ignorar URLs de ejemplo/prueba
  if (url.includes('ejemplo') || url.includes('example') || url.includes('test')) {
    return false
  }
  return true
}

/**
 * Obtener variante del badge según estado del cajero
 */
const getEstadoBadgeVariant = (estado) => {
  switch (estado) {
    case 'activo':
      return 'success'
    case 'inactivo':
      return 'warning'
    case 'bloqueado':
      return 'danger'
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
    bloqueado: 'Bloqueado',
  }
  return estados[estado] || estado
}

function CajerosLista() {
  const navigate = useNavigate()
  const { cajeros, loading, error, refetch, eliminarCajero } = useCajeros()
  const { tienePermiso } = usePermisos()
  const [eliminando, setEliminando] = useState(null)
  const [cajeroExpandido, setCajeroExpandido] = useState(null)
  const [cajeroAEliminar, setCajeroAEliminar] = useState(null)
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')

  const handleEditar = (cajeroId) => {
    navigate(`/administracion/cajeros/editar/${cajeroId}`)
  }

  const handleEliminarClick = (cajero) => {
    setCajeroAEliminar(cajero)
    setMostrarModalEliminar(true)
  }

  const handleConfirmarEliminar = async () => {
    if (!cajeroAEliminar) return

    setEliminando(cajeroAEliminar._id)
    const resultado = await eliminarCajero(cajeroAEliminar._id)
    setEliminando(null)

    if (!resultado.success) {
      alert(`Error al eliminar: ${resultado.error}`)
    } else {
      // Cerrar modal después de eliminar exitosamente
      setMostrarModalEliminar(false)
      const nombreEliminado = cajeroAEliminar.nombreCompleto
      setCajeroAEliminar(null)
      // Mostrar mensaje de éxito
      setMensajeExito(`Cajero "${nombreEliminado}" eliminado exitosamente`)
      // Auto-ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setMensajeExito('')
      }, 5000)
    }
  }

  const toggleExpandir = (id) => {
    setCajeroExpandido(cajeroExpandido === id ? null : id)
  }

  if (loading) {
    return (
      <div className="cajeros-lista-loading">
        <LoadingSpinner />
        <p>Cargando cajeros...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cajeros-lista-error">
        <p>Error al cargar cajeros: {error}</p>
        <button onClick={refetch} className="btn-retry">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="cajeros-lista">
      <div className="lista-header">
        <div className="lista-header-left">
          <h3>Lista de Cajeros</h3>
          <span className="lista-count">{cajeros.length} cajeros</span>
        </div>
        <div className="lista-header-right">
          <button onClick={() => navigate('/administracion/cajeros/crear')} className="btn-crear">
            ➕ Crear Cajero
          </button>
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

      {cajeros.length === 0 ? (
        <div className="lista-vacia">
          <p>No hay cajeros registrados</p>
        </div>
      ) : (
        <div className="lista-tabla-container">
          <table className="lista-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cajeros.map((cajero) => (
                <Fragment key={cajero._id}>
                  <tr className={cajeroExpandido === cajero._id ? 'fila-expandida' : ''}>
                    <td className="celda-nombre">
                      <div className="nombre-container">
                        {esUrlImagenValida(cajero.foto) ? (
                          <img src={cajero.foto} alt="" className="cajero-avatar" />
                        ) : (
                          <div className="cajero-avatar-placeholder">
                            {cajero.nombreCompleto.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{cajero.nombreCompleto}</span>
                      </div>
                    </td>
                    <td>{cajero.email}</td>
                    <td>{cajero.telefonoContacto}</td>
                    <td>
                      <Badge variant={getEstadoBadgeVariant(cajero.estado)}>
                        {formatEstado(cajero.estado)}
                      </Badge>
                    </td>
                    <td className="celda-acciones">
                      <button
                        className="btn-accion btn-ver"
                        onClick={() => toggleExpandir(cajero._id)}
                        title="Ver detalles"
                      >
                        {cajeroExpandido === cajero._id ? '▲' : '▼'}
                      </button>
                      {tienePermiso('CAJEROS_MODIFICAR') && (
                        <button
                          className="btn-accion btn-editar"
                          onClick={() => handleEditar(cajero._id)}
                          title="Editar cajero"
                        >
                          ✏️
                        </button>
                      )}
                      {tienePermiso('CAJEROS_ELIMINAR') && (
                        <button
                          className="btn-accion btn-eliminar"
                          onClick={() => handleEliminarClick(cajero)}
                          disabled={eliminando === cajero._id}
                          title="Eliminar cajero"
                        >
                          {eliminando === cajero._id ? '...' : '🗑️'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {cajeroExpandido === cajero._id && (
                    <tr className="fila-detalles">
                      <td colSpan="5">
                        <div className="detalles-container">
                          <div className="detalle-grupo">
                            <h4>Datos de Pago Móvil</h4>
                            <div className="detalle-grid">
                              <div className="detalle-item">
                                <span className="detalle-label">Banco:</span>
                                <span className="detalle-value">{cajero.datosPagoMovil?.banco || 'N/A'}</span>
                              </div>
                              <div className="detalle-item">
                                <span className="detalle-label">Cédula:</span>
                                <span className="detalle-value">
                                  {cajero.datosPagoMovil?.cedula 
                                    ? `${cajero.datosPagoMovil.cedula.prefijo}-${cajero.datosPagoMovil.cedula.numero}`
                                    : 'N/A'
                                  }
                                </span>
                              </div>
                              <div className="detalle-item">
                                <span className="detalle-label">Teléfono Pago:</span>
                                <span className="detalle-value">{cajero.datosPagoMovil?.telefono || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="detalle-grupo">
                            <h4>Información Adicional</h4>
                            <div className="detalle-grid">
                              <div className="detalle-item">
                                <span className="detalle-label">ID:</span>
                                <span className="detalle-value detalle-mono">{cajero._id}</span>
                              </div>
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

      <ConfirmarEliminarCajero
        isOpen={mostrarModalEliminar}
        onClose={() => {
          setMostrarModalEliminar(false)
          setCajeroAEliminar(null)
        }}
        cajero={cajeroAEliminar}
        onConfirm={handleConfirmarEliminar}
        eliminando={eliminando === cajeroAEliminar?._id}
      />
    </div>
  )
}

export default CajerosLista
