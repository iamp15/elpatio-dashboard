/**
 * Hook para cargar los datos de un admin específico
 */

import { useState, useEffect, useCallback } from 'react'
import { getAdmins } from '../services/api'

/**
 * Hook para cargar los datos de un admin por ID
 * @param {string} adminId - ID del admin a cargar
 * @returns {Object} Estado y funciones relacionadas con el admin
 */
export function useAdmin(adminId) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAdmin = useCallback(async () => {
    if (!adminId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const admins = await getAdmins()
      const adminEncontrado = admins.find(a => a._id === adminId)
      
      if (!adminEncontrado) {
        throw new Error('Admin no encontrado')
      }
      
      setAdmin(adminEncontrado)
    } catch (err) {
      console.error('❌ Error cargando admin:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [adminId])

  useEffect(() => {
    loadAdmin()
  }, [loadAdmin])

  return {
    admin,
    loading,
    error,
    refetch: loadAdmin,
  }
}
