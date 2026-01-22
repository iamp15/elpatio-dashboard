/**
 * Modal de confirmación para eliminar un cajero
 * Requiere escribir el nombre del cajero para confirmar
 */

import { useState } from 'react'
import Modal from '../ui/Modal'
import './ConfirmarEliminarCajero.css'

function ConfirmarEliminarCajero({ isOpen, onClose, cajero, onConfirm, eliminando }) {
  const [nombreConfirmacion, setNombreConfirmacion] = useState('')
  const [error, setError] = useState('')

  // Resetear cuando se abre/cierra el modal
  const handleClose = () => {
    setNombreConfirmacion('')
    setError('')
    onClose()
  }

  const handleConfirm = () => {
    if (!cajero) return

    // Comparar nombres sin importar mayúsculas/minúsculas
    const nombreCoincide = nombreConfirmacion.trim().toLowerCase() === cajero.nombreCompleto.toLowerCase()

    if (!nombreCoincide) {
      setError('El nombre no coincide con el cajero a eliminar')
      return
    }

    onConfirm()
    handleClose()
  }

  const handleChange = (e) => {
    setNombreConfirmacion(e.target.value)
    // Limpiar error cuando el usuario escribe
    if (error) {
      setError('')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="modal-eliminar-cajero">
      <div className="confirmar-eliminar">
        <div className="confirmar-eliminar-header">
          <h3>⚠️ Confirmar Eliminación</h3>
        </div>

        <div className="confirmar-eliminar-body">
          <p className="confirmar-eliminar-mensaje">
            Estás a punto de eliminar permanentemente a <strong>{cajero?.nombreCompleto}</strong>.
          </p>
          <p className="confirmar-eliminar-advertencia">
            Esta acción no se puede deshacer.
          </p>

          <div className="confirmar-eliminar-input">
            <label htmlFor="nombreConfirmacion">
              Para confirmar, escribe el nombre del cajero: <strong>{cajero?.nombreCompleto}</strong>
            </label>
            <input
              type="text"
              id="nombreConfirmacion"
              value={nombreConfirmacion}
              onChange={handleChange}
              placeholder="Escribe el nombre completo aquí"
              autoFocus
              disabled={eliminando}
              className={error ? 'input-error' : ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !eliminando) {
                  handleConfirm()
                }
              }}
            />
            {error && (
              <span className="error-texto">{error}</span>
            )}
          </div>
        </div>

        <div className="confirmar-eliminar-footer">
          <button
            type="button"
            className="btn-cancelar"
            onClick={handleClose}
            disabled={eliminando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-confirmar-eliminar"
            onClick={handleConfirm}
            disabled={eliminando || nombreConfirmacion.trim() === ''}
          >
            {eliminando ? 'Eliminando...' : 'Eliminar Cajero'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmarEliminarCajero
