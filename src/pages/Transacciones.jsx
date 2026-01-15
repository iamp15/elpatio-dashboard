import { useState, useEffect } from 'react'
import { getTransacciones, getTransaccionesEnCurso, getTransaccionDetalles } from '../services/api'
import webSocketService from '../services/websocket'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import './Transacciones.css'

function Transacciones() {
  const [activeTab, setActiveTab] = useState('en-curso') // 'en-curso' o 'historial'
  const [transacciones, setTransacciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filtros para historial
  const [filtros, setFiltros] = useState({
    tipo: '',
    categoria: '',
    estado: '',
    fechaInicio: '',
    fechaFin: '',
    pagina: 1,
    limite: 20,
  })
  
  // Paginación
  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina: 1,
    limite: 20,
    totalPaginas: 0,
  })
  
  // Detalles de transacción
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null)
  const [mostrarDetalles, setMostrarDetalles] = useState(false)

  useEffect(() => {
    cargarTransacciones()
    
    // Auto-refresh cada 30 segundos si está en la pestaña "en-curso" (fallback si no hay WebSocket)
    let interval = null
    if (activeTab === 'en-curso' && !webSocketService.getConnectionState().isConnected) {
      interval = setInterval(cargarTransacciones, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeTab, filtros])

  useEffect(() => {
    // Escuchar actualizaciones en tiempo real para transacciones
    if (activeTab === 'en-curso' && webSocketService.getConnectionState().isConnected) {
      const handleEstadoActualizado = (estado) => {
        // Recargar transacciones en curso cuando hay actualizaciones
        if (estado?.estadisticas?.transaccionesActivas !== undefined) {
          cargarTransacciones()
        }
      }

      const handleTransactionUpdate = (data) => {
        // Recargar cuando hay actualización específica de transacción
        if (activeTab === 'en-curso') {
          cargarTransacciones()
        }
      }

      webSocketService.on('estado-actualizado', handleEstadoActualizado)
      webSocketService.on('transaction-update', handleTransactionUpdate)

      return () => {
        webSocketService.off('estado-actualizado', handleEstadoActualizado)
        webSocketService.off('transaction-update', handleTransactionUpdate)
      }
    }
  }, [activeTab])

  const cargarTransacciones = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (activeTab === 'en-curso') {
        const data = await getTransaccionesEnCurso(50)
        setTransacciones(data.transacciones || [])
      } else {
        const data = await getTransacciones(filtros)
        setTransacciones(data.transacciones || [])
        setPaginacion(data.paginacion || {})
      }
    } catch (err) {
      console.error('Error cargando transacciones:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerDetalles = async (transaccionId) => {
    try {
      const data = await getTransaccionDetalles(transaccionId)
      setTransaccionSeleccionada(data.transaccion)
      setMostrarDetalles(true)
    } catch (err) {
      console.error('Error cargando detalles:', err)
      alert('Error al cargar los detalles de la transacción')
    }
  }

  const getBadgeVariant = (estado) => {
    const map = {
      pendiente: 'pending',
      en_proceso: 'warning',
      completada: 'completed',
      completada_con_ajuste: 'success',
      rechazada: 'rejected',
      cancelada: 'cancelled',
      fallida: 'danger',
      revertida: 'default',
    }
    return map[estado] || 'default'
  }

  const formatCurrency = (monto) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format((monto || 0) / 100)
  }

  const formatDate = (fecha) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleString('es-VE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      pagina: key !== 'pagina' ? 1 : prev.pagina, // Resetear página al cambiar otros filtros
    }))
  }

  const handlePaginaChange = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: nuevaPagina }))
  }

  return (
    <div className="transacciones-page">
      <div className="page-header">
        <h1>Gestión de Transacciones</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'en-curso' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('en-curso')}
        >
          En Curso
        </button>
        <button
          className={`tab ${activeTab === 'historial' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          Historial
        </button>
      </div>

      {activeTab === 'historial' && (
        <div className="filtros-container">
          <div className="filtros-grid">
            <div className="filtro-group">
              <label>Tipo</label>
              <select
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
            <div className="filtro-group">
              <label>Categoría</label>
              <select
                value={filtros.categoria}
                onChange={(e) => handleFiltroChange('categoria', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="deposito">Depósito</option>
                <option value="retiro">Retiro</option>
                <option value="entrada_sala">Entrada Sala</option>
                <option value="premio_juego">Premio Juego</option>
                <option value="reembolso">Reembolso</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div className="filtro-group">
              <label>Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completada">Completada</option>
                <option value="rechazada">Rechazada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="filtro-group">
              <label>Fecha Inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
              />
            </div>
            <div className="filtro-group">
              <label>Fecha Fin</label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
              />
            </div>
            <div className="filtro-group">
              <label>Registros por página</label>
              <select
                value={filtros.limite}
                onChange={(e) => handleFiltroChange('limite', parseInt(e.target.value))}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="error-message">
          <p>❌ Error: {error}</p>
          <Button onClick={cargarTransacciones}>Reintentar</Button>
        </div>
      ) : (
        <>
          {activeTab === 'en-curso' && transacciones.length === 0 && (
            <div className="empty-state">
              <p>No hay transacciones en curso</p>
            </div>
          )}
          
          {transacciones.length > 0 && (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>ID</Table.Header>
                  <Table.Header>Jugador</Table.Header>
                  <Table.Header>Tipo</Table.Header>
                  <Table.Header>Categoría</Table.Header>
                  <Table.Header>Monto</Table.Header>
                  <Table.Header>Estado</Table.Header>
                  <Table.Header>Fecha</Table.Header>
                  <Table.Header>Acciones</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {transacciones.map((trans) => (
                  <Table.Row key={trans._id}>
                    <Table.Cell>{trans._id.slice(-8)}</Table.Cell>
                    <Table.Cell>
                      {trans.jugadorId?.username || trans.jugadorId?.telegramId || '-'}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={trans.tipo === 'credito' ? 'success' : 'danger'}>
                        {trans.tipo}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{trans.categoria.replace('_', ' ')}</Table.Cell>
                    <Table.Cell className="text-right">{formatCurrency(trans.monto)}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={getBadgeVariant(trans.estado)}>
                        {trans.estado.replace('_', ' ')}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{formatDate(trans.createdAt)}</Table.Cell>
                    <Table.Cell>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleVerDetalles(trans._id)}
                      >
                        Ver
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}

          {activeTab === 'historial' && paginacion.totalPaginas > 1 && (
            <div className="paginacion">
              <Button
                variant="secondary"
                onClick={() => handlePaginaChange(paginacion.pagina - 1)}
                disabled={paginacion.pagina === 1}
              >
                Anterior
              </Button>
              <span className="paginacion-info">
                Página {paginacion.pagina} de {paginacion.totalPaginas} ({paginacion.total} total)
              </span>
              <Button
                variant="secondary"
                onClick={() => handlePaginaChange(paginacion.pagina + 1)}
                disabled={paginacion.pagina >= paginacion.totalPaginas}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      {mostrarDetalles && transaccionSeleccionada && (
        <div className="modal-overlay" onClick={() => setMostrarDetalles(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de Transacción</h2>
              <button className="modal-close" onClick={() => setMostrarDetalles(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detalle-grid">
                <div className="detalle-item">
                  <label>ID:</label>
                  <span>{transaccionSeleccionada._id}</span>
                </div>
                <div className="detalle-item">
                  <label>Referencia:</label>
                  <span>{transaccionSeleccionada.referencia}</span>
                </div>
                <div className="detalle-item">
                  <label>Jugador:</label>
                  <span>
                    {transaccionSeleccionada.jugadorId?.username || 
                     transaccionSeleccionada.jugadorId?.telegramId || 
                     '-'}
                  </span>
                </div>
                <div className="detalle-item">
                  <label>Tipo:</label>
                  <Badge variant={transaccionSeleccionada.tipo === 'credito' ? 'success' : 'danger'}>
                    {transaccionSeleccionada.tipo}
                  </Badge>
                </div>
                <div className="detalle-item">
                  <label>Categoría:</label>
                  <span>{transaccionSeleccionada.categoria.replace('_', ' ')}</span>
                </div>
                <div className="detalle-item">
                  <label>Estado:</label>
                  <Badge variant={getBadgeVariant(transaccionSeleccionada.estado)}>
                    {transaccionSeleccionada.estado.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="detalle-item">
                  <label>Monto:</label>
                  <span className="detalle-monto">{formatCurrency(transaccionSeleccionada.monto)}</span>
                </div>
                <div className="detalle-item">
                  <label>Saldo Anterior:</label>
                  <span>{formatCurrency(transaccionSeleccionada.saldoAnterior)}</span>
                </div>
                <div className="detalle-item">
                  <label>Saldo Nuevo:</label>
                  <span>{formatCurrency(transaccionSeleccionada.saldoNuevo)}</span>
                </div>
                <div className="detalle-item">
                  <label>Descripción:</label>
                  <span>{transaccionSeleccionada.descripcion}</span>
                </div>
                <div className="detalle-item">
                  <label>Fecha Creación:</label>
                  <span>{formatDate(transaccionSeleccionada.createdAt)}</span>
                </div>
                {transaccionSeleccionada.cajeroId && (
                  <div className="detalle-item">
                    <label>Cajero Asignado:</label>
                    <span>{transaccionSeleccionada.cajeroId.nombreCompleto || '-'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <Button onClick={() => setMostrarDetalles(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transacciones
