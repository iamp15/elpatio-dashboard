/**
 * Hook para gestionar la carga de estadísticas del dashboard
 */

import { useState, useEffect } from 'react'
import { getStatsGlobales } from '../services/api'

/**
 * Hook para cargar y gestionar estadísticas del dashboard
 * @returns {Object} Estado y funciones relacionadas con estadísticas
 */
export function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      setError(null)
      const statsData = await getStatsGlobales()
      setStats(statsData)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    stats,
    loading,
    error,
    loadData,
  }
}
