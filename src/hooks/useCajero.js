/**
 * Hook para cargar los datos de un cajero específico
 */

import { useState, useEffect, useCallback } from 'react'
import { getCajeros } from '../services/api'

/**
 * Hook para cargar los datos de un cajero por ID
 * @param {string} cajeroId - ID del cajero a cargar
 * @returns {Object} Estado y funciones relacionadas con el cajero
 */
export function useCajero(cajeroId) {
  const [cajero, setCajero] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCajero = useCallback(async () => {
    if (!cajeroId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const cajeros = await getCajeros()
      const cajeroEncontrado = cajeros.find(c => c._id === cajeroId)
      
      if (!cajeroEncontrado) {
        throw new Error('Cajero no encontrado')
      }
      
      setCajero(cajeroEncontrado)
    } catch (err) {
      console.error('❌ Error cargando cajero:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [cajeroId])

  useEffect(() => {
    loadCajero()
  }, [loadCajero])

  return {
    cajero,
    loading,
    error,
    refetch: loadCajero,
  }
}
