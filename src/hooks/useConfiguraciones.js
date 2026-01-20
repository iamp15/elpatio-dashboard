/**
 * Hook para gestionar configuraciones del sistema
 */

import { useState, useEffect } from 'react'
import { getAllConfigs, updateConfig } from '../services/api'

/**
 * Hook para cargar y gestionar configuraciones
 * @returns {Object} Estado y funciones relacionadas con configuraciones
 */
export function useConfiguraciones() {
  const [configuraciones, setConfiguraciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editando, setEditando] = useState({}) // { clave: valor }
  const [guardando, setGuardando] = useState({}) // { clave: true/false }

  const cargarConfiguraciones = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllConfigs()
      // La API retorna { ok: true, configuraciones: [...] }
      setConfiguraciones(data.configuraciones || [])
    } catch (err) {
      console.error('Error cargando configuraciones:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarConfiguraciones()
  }, [])

  const handleEditar = (clave, valorActual) => {
    setEditando(prev => ({
      ...prev,
      [clave]: valorActual,
    }))
  }

  const handleCancelar = (clave) => {
    const nuevasEdiciones = { ...editando }
    delete nuevasEdiciones[clave]
    setEditando(nuevasEdiciones)
  }

  const handleCambioValor = (clave, nuevoValor) => {
    setEditando(prev => ({
      ...prev,
      [clave]: nuevoValor,
    }))
  }

  const handleGuardar = async (clave, valor) => {
    try {
      setGuardando(prev => ({ ...prev, [clave]: true }))
      await updateConfig(clave, valor)
      
      // Actualizar la lista de configuraciones
      const nuevasConfiguraciones = configuraciones.map(config => 
        config.clave === clave ? { ...config, valor } : config
      )
      setConfiguraciones(nuevasConfiguraciones)
      
      // Remover de editando
      handleCancelar(clave)
      
      // Mostrar mensaje de éxito
      alert('✅ Configuración actualizada correctamente')
    } catch (err) {
      console.error('Error guardando configuración:', err)
      alert(`❌ Error al guardar: ${err.message}`)
    } finally {
      setGuardando(prev => ({ ...prev, [clave]: false }))
    }
  }

  return {
    configuraciones,
    loading,
    error,
    editando,
    guardando,
    handleEditar,
    handleCancelar,
    handleCambioValor,
    handleGuardar,
    refetch: cargarConfiguraciones,
  }
}
