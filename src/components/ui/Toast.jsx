/**
 * Componente Toast para mostrar mensajes temporales
 * Se muestra como pop-out y desaparece automáticamente después de unos segundos
 */

import { useEffect, useState } from 'react'
import './Toast.css'

/**
 * Componente Toast
 * @param {Object} props
 * @param {string} props.message - Mensaje a mostrar
 * @param {string} props.type - Tipo de toast: 'success', 'error', 'info', 'warning'
 * @param {number} props.duration - Duración en milisegundos (default: 3000)
 * @param {Function} props.onClose - Callback cuando se cierra el toast
 * @param {boolean} props.show - Controla si se muestra el toast
 */
function Toast({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose,
  show = true 
}) {
  const [isVisible, setIsVisible] = useState(show)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setIsExiting(false)
      
      // Auto-cerrar después de la duración especificada
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      if (onClose) {
        onClose()
      }
    }, 300) // Tiempo de animación de salida
  }

  if (!isVisible) {
    return null
  }

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <div 
      className={`toast toast-${type} ${isExiting ? 'toast-exiting' : 'toast-entering'}`}
      role="alert"
    >
      <span className="toast-icon">{iconMap[type] || 'ℹ️'}</span>
      <span className="toast-message">{message}</span>
      <button 
        className="toast-close"
        onClick={handleClose}
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  )
}

export default Toast
