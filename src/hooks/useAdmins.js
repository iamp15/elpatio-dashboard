/**
 * Hook para gestionar la carga y manipulación de admins
 */

import { useState, useEffect, useCallback } from 'react'
import { getAdmins, eliminarAdmin as eliminarAdminApi } from '../services/api'

/**
 * Hook para cargar y gestionar la lista de admins
 * @returns {Object} Estado y funciones relacionadas con admins
 */
export function useAdmins() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdmins()
      setAdmins(data)
    } catch (err) {
      console.error('❌ Error cargando admins:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarAdmin = async (id) => {
    try {
      await eliminarAdminApi(id)
      // Actualizar lista local removiendo el admin eliminado
      setAdmins(prev => prev.filter(a => a._id !== id))
      return { success: true }
    } catch (err) {
      console.error('❌ Error eliminando admin:', err)
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  return {
    admins,
    loading,
    error,
    refetch: loadAdmins,
    eliminarAdmin,
  }
}
