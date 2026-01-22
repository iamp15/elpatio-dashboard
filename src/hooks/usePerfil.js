/**
 * Hook para gestionar la carga del perfil del usuario
 */

import { useState, useEffect } from 'react'
import { getMiPerfil } from '../services/api'

/**
 * Hook para cargar y gestionar el perfil del admin autenticado
 * @returns {Object} Estado y funciones relacionadas con el perfil
 */
export function usePerfil() {
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadPerfil = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getMiPerfil()
      setPerfil(response.admin)
    } catch (err) {
      console.error('❌ Error cargando perfil:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPerfil()
  }, [])

  return {
    perfil,
    loading,
    error,
    refetch: loadPerfil,
  }
}
