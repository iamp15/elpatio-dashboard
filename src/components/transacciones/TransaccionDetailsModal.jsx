/**
 * Componente para mostrar el modal con los detalles de una transacción
 */

import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatCurrency, formatDate, getBadgeVariant } from '../../utils/formatters'

/**
 * Modal con detalles de transacción
 * @param {Object} transaccion - Objeto con los datos de la transacción
 * @param {boolean} isOpen - Indica si el modal está abierto
 * @param {Function} onClose - Callback para cerrar el modal
 */
function TransaccionDetailsModal({ transaccion, isOpen, onClose }) {
  if (!isOpen || !transaccion) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalles de Transacción</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="detalle-grid">
            <div className="detalle-item">
              <label>ID:</label>
              <span>{transaccion._id}</span>
            </div>
            <div className="detalle-item">
              <label>Referencia:</label>
              <span>{transaccion.referencia}</span>
            </div>
            <div className="detalle-item">
              <label>Jugador:</label>
              <span>
                {transaccion.jugadorId?.username || 
                 transaccion.jugadorId?.telegramId || 
                 '-'}
              </span>
            </div>
            <div className="detalle-item">
              <label>Tipo:</label>
              <Badge variant={transaccion.tipo === 'credito' ? 'success' : 'danger'}>
                {transaccion.tipo}
              </Badge>
            </div>
            <div className="detalle-item">
              <label>Categoría:</label>
              <span>{transaccion.categoria.replace('_', ' ')}</span>
            </div>
            <div className="detalle-item">
              <label>Estado:</label>
              <Badge variant={getBadgeVariant(transaccion.estado)}>
                {transaccion.estado.replace('_', ' ')}
              </Badge>
            </div>
            <div className="detalle-item">
              <label>Monto:</label>
              <span className="detalle-monto">{formatCurrency(transaccion.monto)}</span>
            </div>
            <div className="detalle-item">
              <label>Saldo Anterior:</label>
              <span>{formatCurrency(transaccion.saldoAnterior)}</span>
            </div>
            <div className="detalle-item">
              <label>Saldo Nuevo:</label>
              <span>{formatCurrency(transaccion.saldoNuevo)}</span>
            </div>
            <div className="detalle-item">
              <label>Descripción:</label>
              <span>{transaccion.descripcion}</span>
            </div>
            <div className="detalle-item">
              <label>Fecha Creación:</label>
              <span>{formatDate(transaccion.createdAt)}</span>
            </div>
            {transaccion.cajeroId && (
              <div className="detalle-item">
                <label>Cajero Asignado:</label>
                <span>{transaccion.cajeroId.nombreCompleto || '-'}</span>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  )
}

export default TransaccionDetailsModal
