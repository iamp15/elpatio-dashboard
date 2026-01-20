/**
 * Hook para gestionar actualizaciones en tiempo real de transacciones vía WebSocket
 */

import { useEffect } from 'react'
import webSocketService from '../services/websocket'

/**
 * Hook para escuchar actualizaciones de transacciones vía WebSocket
 * @param {string} activeTab - Pestaña activa
 * @param {Function} onUpdate - Callback cuando hay actualización (para recargar datos)
 */
export function useTransaccionesWebSocket(activeTab, onUpdate) {
  useEffect(() => {
    // Escuchar actualizaciones en tiempo real para transacciones
    if (activeTab === 'en-curso' && webSocketService.getConnectionState().isConnected) {
      const handleEstadoActualizado = (estado) => {
        // Recargar transacciones en curso cuando hay actualizaciones
        if (estado?.estadisticas?.transaccionesActivas !== undefined) {
          onUpdate()
        }
      }

      const handleTransactionUpdate = (data) => {
        // Recargar cuando hay actualización específica de transacción
        if (activeTab === 'en-curso') {
          onUpdate()
        }
      }

      webSocketService.on('estado-actualizado', handleEstadoActualizado)
      webSocketService.on('transaction-update', handleTransactionUpdate)

      return () => {
        webSocketService.off('estado-actualizado', handleEstadoActualizado)
        webSocketService.off('transaction-update', handleTransactionUpdate)
      }
    }
  }, [activeTab, onUpdate])

  // Polling de respaldo cada 30 segundos si está en la pestaña "en-curso" (fallback si no hay WebSocket)
  useEffect(() => {
    if (activeTab === 'en-curso' && !webSocketService.getConnectionState().isConnected) {
      const interval = setInterval(onUpdate, 30000)
      return () => clearInterval(interval)
    }
  }, [activeTab, onUpdate])
}
