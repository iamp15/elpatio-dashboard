import { useState, useCallback } from 'react'
import { getTransaccionDetalles } from '../services/api'
import { useTransacciones } from '../hooks/useTransacciones'
import { useTransaccionesFilters } from '../hooks/useTransaccionesFilters'
import { useTransaccionesWebSocket } from '../hooks/useTransaccionesWebSocket'
import TransaccionesTabs from '../components/transacciones/TransaccionesTabs'
import TransaccionFilters from '../components/transacciones/TransaccionFilters'
import TransaccionesList from '../components/transacciones/TransaccionesList'
import TransaccionDetailsModal from '../components/transacciones/TransaccionDetailsModal'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import './Transacciones.css'

function Transacciones() {
  const [activeTab, setActiveTab] = useState('en-curso')
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null)
  const [mostrarDetalles, setMostrarDetalles] = useState(false)

  const { filtros, handleFiltroChange, handlePaginaChange } = useTransaccionesFilters()
  
  const { transacciones, loading, error, paginacion, refetch } = useTransacciones(activeTab, filtros)

  // Callback para recargar transacciones (usado por WebSocket)
  const handleUpdate = useCallback(() => {
    refetch()
  }, [refetch])

  useTransaccionesWebSocket(activeTab, handleUpdate)

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

  const handleActualizar = () => {
    refetch()
  }

  return (
    <div className="transacciones-page">
      <div className="page-header">
        <h1>Gestión de Transacciones</h1>
        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={loading}
        >
          {loading ? 'Actualizando...' : '🔄 Actualizar'}
        </Button>
      </div>

      <TransaccionesTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'historial' && (
        <TransaccionFilters filtros={filtros} onFiltroChange={handleFiltroChange} />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="error-message">
          <p>❌ Error: {error}</p>
          <Button onClick={refetch}>Reintentar</Button>
        </div>
      ) : (
        <>
          {activeTab === 'en-curso' && transacciones.length === 0 && (
            <div className="empty-state">
              <p>No hay transacciones en curso</p>
            </div>
          )}
          
          <TransaccionesList 
            transacciones={transacciones} 
            onVerDetalles={handleVerDetalles} 
          />

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

      <TransaccionDetailsModal
        transaccion={transaccionSeleccionada}
        isOpen={mostrarDetalles}
        onClose={() => setMostrarDetalles(false)}
      />
    </div>
  )
}

export default Transacciones
