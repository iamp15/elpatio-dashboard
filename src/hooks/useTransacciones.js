/**
 * Hook para gestionar la carga de transacciones
 * Maneja la carga de transacciones según la pestaña activa
 */

import { useState, useEffect, useCallback } from 'react'
import { getTransacciones, getTransaccionesEnCurso } from '../services/api'

/**
 * Hook para cargar y gestionar transacciones
 * @param {string} activeTab - Pestaña activa ('en-curso' o 'historial')
 * @param {Object} filtros - Filtros para la pestaña historial
 * @returns {Object} Estado y funciones relacionadas con transacciones
 */
export function useTransacciones(activeTab, filtros) {
  const [transacciones, setTransacciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina: 1,
    limite: 20,
    totalPaginas: 0,
  })

  const cargarTransacciones = useCallback(async () => {
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
  }, [activeTab, filtros])

  useEffect(() => {
    cargarTransacciones()
  }, [cargarTransacciones])

  return {
    transacciones,
    loading,
    error,
    paginacion,
    refetch: cargarTransacciones,
  }
}
