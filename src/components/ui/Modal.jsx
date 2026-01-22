/**
 * Componente Modal reutilizable
 */

import { useEffect, useRef } from 'react'
import './Modal.css'

function Modal({ isOpen, onClose, children, className = '' }) {
  const modalRef = useRef(null)

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Cerrar al hacer click fuera del modal
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" ref={modalRef} onClick={handleBackdropClick}>
      <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export default Modal
