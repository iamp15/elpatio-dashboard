/**
 * Hook para gestionar configuraciones de PaymentConfig
 * Maneja carga, edición y actualización de configuraciones del sistema de pagos
 */

import { useState, useEffect } from 'react'
import { getPaymentConfig, updatePaymentConfig } from '../services/api'
import {
  convertirBolivaresACentavos,
  convertirCentavosABolivares,
  requiereConversionMoneda,
  validarValor,
  formatearValorParaUI
} from '../utils/paymentConfig'

/**
 * Hook para cargar y gestionar configuraciones de PaymentConfig
 * @returns {Object} Estado y funciones relacionadas con configuraciones
 */
export function usePaymentConfig() {
  const [configuraciones, setConfiguraciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editando, setEditando] = useState({}) // { "precios.ludo.1v1": valorEnUI }
  const [guardando, setGuardando] = useState({}) // { "precios.ludo.1v1": true/false }
  const [toast, setToast] = useState(null) // { message, type, show }

  /**
   * Carga todas las configuraciones desde el backend
   */
  const cargarConfiguraciones = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getPaymentConfig()
      
      // El backend retorna: { success: true, data: { precios: {}, limites: {}, ... } }
      if (response.success && response.data) {
        // Convertir estructura anidada a array plano para facilitar manejo
        const configsArray = []
        
        Object.keys(response.data).forEach(configType => {
          const tipoData = response.data[configType]
          
          // Función recursiva para aplanar estructura anidada
          const aplanarConfig = (obj, prefix = '') => {
            Object.keys(obj).forEach(key => {
              const fullKey = prefix ? `${prefix}.${key}` : key
              const value = obj[key]
              
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Es un objeto anidado, continuar recursión
                aplanarConfig(value, fullKey)
              } else {
                // Es un valor final
                configsArray.push({
                  configType,
                  configKey: fullKey,
                  configValue: value
                })
              }
            })
          }
          
          aplanarConfig(tipoData)
        })
        
        setConfiguraciones(configsArray)
      } else {
        setConfiguraciones([])
      }
    } catch (err) {
      console.error('Error cargando configuraciones de PaymentConfig:', err)
      setError(err.message || 'Error al cargar configuraciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarConfiguraciones()
  }, [])

  /**
   * Inicia el modo de edición para una configuración
   */
  const handleEditar = (configType, configKey, valorActual) => {
    const key = `${configType}.${configKey}`
    
    // Convertir valor para mostrar en UI
    let valorParaUI = valorActual
    
    if (requiereConversionMoneda(configType, configKey)) {
      // Convertir centavos a bolívares para mostrar
      valorParaUI = convertirCentavosABolivares(valorActual)
    }
    
    setEditando(prev => ({
      ...prev,
      [key]: valorParaUI
    }))
  }

  /**
   * Cancela la edición de una configuración
   */
  const handleCancelar = (configType, configKey) => {
    const key = `${configType}.${configKey}`
    const nuevasEdiciones = { ...editando }
    delete nuevasEdiciones[key]
    setEditando(nuevasEdiciones)
  }

  /**
   * Maneja el cambio de valor durante la edición
   */
  const handleCambioValor = (configType, configKey, nuevoValor) => {
    const key = `${configType}.${configKey}`
    setEditando(prev => ({
      ...prev,
      [key]: nuevoValor
    }))
  }

  /**
   * Guarda una configuración actualizada
   */
  const handleGuardar = async (configType, configKey, valorEnUI) => {
    const key = `${configType}.${configKey}`
    
    try {
      // 1. Convertir valor según tipo
      let valorParaBackend
      
      if (requiereConversionMoneda(configType, configKey)) {
        // Valores monetarios: convertir bolívares a centavos
        valorParaBackend = convertirBolivaresACentavos(valorEnUI)
      } else {
        // Otros valores: convertir a tipo apropiado
        if (typeof valorEnUI === 'string') {
          // Intentar convertir a número si es posible
          const numValue = parseFloat(valorEnUI)
          valorParaBackend = isNaN(numValue) ? valorEnUI : numValue
        } else {
          valorParaBackend = valorEnUI
        }
      }
      
      // 2. Validar valor
      const validacion = validarValor(configType, configKey, valorParaBackend)
      if (!validacion.valido) {
        throw new Error(validacion.mensaje)
      }
      
      // 3. Mostrar loading
      setGuardando(prev => ({ ...prev, [key]: true }))
      
      // 4. Llamar API
      await updatePaymentConfig(configType, configKey, valorParaBackend)
      
      // 5. Actualizar estado local
      setConfiguraciones(prev =>
        prev.map(config =>
          config.configType === configType && config.configKey === configKey
            ? { ...config, configValue: valorParaBackend }
            : config
        )
      )
      
      // 6. Cerrar modo edición
      handleCancelar(configType, configKey)
      
      // 7. Mostrar éxito con toast
      setToast({
        message: 'Configuración actualizada correctamente',
        type: 'success',
        show: true
      })
    } catch (err) {
      console.error('Error guardando configuración:', err)
      setToast({
        message: err.message || 'Error al guardar la configuración',
        type: 'error',
        show: true
      })
      throw err // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setGuardando(prev => ({ ...prev, [key]: false }))
    }
  }

  /**
   * Obtiene el valor en edición o el valor actual
   */
  const getValorEdicion = (configType, configKey) => {
    const key = `${configType}.${configKey}`
    if (editando.hasOwnProperty(key)) {
      return editando[key]
    }
    
    const config = configuraciones.find(
      c => c.configType === configType && c.configKey === configKey
    )
    
    if (!config) return null
    
    // Convertir para mostrar en UI si es necesario
    if (requiereConversionMoneda(configType, configKey)) {
      return convertirCentavosABolivares(config.configValue)
    }
    
    return config.configValue
  }

  /**
   * Verifica si una configuración está siendo editada
   */
  const estaEditando = (configType, configKey) => {
    const key = `${configType}.${configKey}`
    return editando.hasOwnProperty(key)
  }

  /**
   * Verifica si una configuración está siendo guardada
   */
  const estaGuardando = (configType, configKey) => {
    const key = `${configType}.${configKey}`
    return guardando[key] === true
  }

  /**
   * Obtiene el valor formateado para mostrar
   */
  const getValorFormateado = (configType, configKey, valor) => {
    return formatearValorParaUI(configType, configKey, valor)
  }

  /**
   * Cierra el toast
   */
  const closeToast = () => {
    setToast(null)
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
    getValorEdicion,
    estaEditando,
    estaGuardando,
    getValorFormateado,
    refetch: cargarConfiguraciones,
    toast,
    closeToast
  }
}
