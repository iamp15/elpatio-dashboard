/**
 * Hook para gestionar la carga y manipulación de cajeros
 */

import { useState, useEffect, useCallback } from 'react'
import { getCajeros, eliminarCajero as eliminarCajeroApi } from '../services/api'

/**
 * Hook para cargar y gestionar la lista de cajeros
 * @returns {Object} Estado y funciones relacionadas con cajeros
 */
export function useCajeros() {
  const [cajeros, setCajeros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCajeros = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCajeros()
      setCajeros(data)
    } catch (err) {
      console.error('❌ Error cargando cajeros:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarCajero = async (id) => {
    try {
      await eliminarCajeroApi(id)
      // Actualizar lista local removiendo el cajero eliminado
      setCajeros(prev => prev.filter(c => c._id !== id))
      return { success: true }
    } catch (err) {
      console.error('❌ Error eliminando cajero:', err)
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    loadCajeros()
  }, [loadCajeros])

  return {
    cajeros,
    loading,
    error,
    refetch: loadCajeros,
    eliminarCajero,
  }
}
