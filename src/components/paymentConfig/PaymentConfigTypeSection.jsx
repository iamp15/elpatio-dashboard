/**
 * Componente para agrupar configuraciones por tipo
 * Organiza visualmente las configuraciones según su tipo (precios, limites, etc.)
 */

import { useMemo } from 'react'
import PaymentConfigCard from './PaymentConfigCard'
import { getConfigDescription } from '../../utils/paymentConfig'

/**
 * Obtiene el título legible para un tipo de configuración
 */
function getTipoLabel(configType) {
  const labels = {
    precios: 'Precios de Juegos',
    limites: 'Límites del Sistema',
    comisiones: 'Comisiones y Tarifas',
    moneda: 'Configuración de Moneda'
  }
  return labels[configType] || configType
}

/**
 * Agrupa configuraciones por categoría (juego, tipo de límite, etc.)
 */
function agruparConfiguraciones(configs, configType) {
  if (configType === 'precios') {
    // Agrupar por juego (ludo, domino)
    const grupos = {}
    configs.forEach(config => {
      const [juego] = config.configKey.split('.')
      if (!grupos[juego]) {
        grupos[juego] = []
      }
      grupos[juego].push(config)
    })
    return grupos
  }

  if (configType === 'limites') {
    // Agrupar por categoría (deposito, retiro, balance, retiros)
    const grupos = {}
    configs.forEach(config => {
      let categoria = 'general'
      if (config.configKey.startsWith('deposito.')) {
        categoria = 'deposito'
      } else if (config.configKey.startsWith('retiro.') && !config.configKey.startsWith('retiros.')) {
        categoria = 'retiro'
      } else if (config.configKey.startsWith('retiros.')) {
        categoria = 'retiros'
      } else if (config.configKey.startsWith('balance.')) {
        categoria = 'balance'
      }
      
      if (!grupos[categoria]) {
        grupos[categoria] = []
      }
      grupos[categoria].push(config)
    })
    return grupos
  }

  if (configType === 'comisiones') {
    // Agrupar por tipo (frecuencia_semanal, fijas, otros)
    const grupos = {
      frecuencia_semanal: [],
      fijas: [],
      otros: []
    }
    
    configs.forEach(config => {
      if (config.configKey.includes('frecuencia_semanal')) {
        grupos.frecuencia_semanal.push(config)
      } else if (config.configKey.includes('comision_fija') || config.configKey.includes('deposito.comision')) {
        grupos.fijas.push(config)
      } else {
        grupos.otros.push(config)
      }
    })
    
    // Eliminar grupos vacíos
    Object.keys(grupos).forEach(key => {
      if (grupos[key].length === 0) {
        delete grupos[key]
      }
    })
    
    return grupos
  }

  // Para moneda, no agrupar
  return { general: configs }
}

/**
 * Obtiene el título de un grupo
 */
function getGrupoLabel(grupoKey, configType) {
  const labels = {
    ludo: 'Ludo',
    domino: 'Dominó',
    deposito: 'Depósitos',
    retiro: 'Retiros',
    retiros: 'Límites de Retiros',
    balance: 'Balance',
    frecuencia_semanal: 'Retiros por Frecuencia Semanal',
    fijas: 'Comisiones Fijas',
    otros: 'Otras Comisiones',
    general: 'General'
  }
  return labels[grupoKey] || grupoKey
}

/**
 * Componente para una sección de tipo de configuración
 * @param {Object} props
 * @param {string} props.configType - Tipo de configuración
 * @param {Array} props.configs - Array de configuraciones
 * @param {Object} props.hookMethods - Métodos del hook usePaymentConfig
 */
function PaymentConfigTypeSection({ configType, configs, hookMethods }) {
  const grupos = useMemo(() => {
    return agruparConfiguraciones(configs, configType)
  }, [configs, configType])

  if (configs.length === 0) {
    return null
  }

  return (
    <div className="payment-config-type-section">
      <h2 className="payment-config-type-title">{getTipoLabel(configType)}</h2>
      
      {Object.entries(grupos).map(([grupoKey, grupoConfigs]) => (
        <div key={grupoKey} className="payment-config-grupo">
          {Object.keys(grupos).length > 1 && (
            <h3 className="payment-config-grupo-title">
              {getGrupoLabel(grupoKey, configType)}
            </h3>
          )}
          
          <div className="payment-config-grid">
            {grupoConfigs.map((config) => {
              const key = `${config.configType}.${config.configKey}`
              return (
                <PaymentConfigCard
                  key={key}
                  config={config}
                  isEditando={hookMethods.estaEditando(config.configType, config.configKey)}
                  valorEdicion={hookMethods.getValorEdicion(config.configType, config.configKey)}
                  estaGuardando={hookMethods.estaGuardando(config.configType, config.configKey)}
                  onEditar={hookMethods.handleEditar}
                  onCancelar={hookMethods.handleCancelar}
                  onCambioValor={hookMethods.handleCambioValor}
                  onGuardar={hookMethods.handleGuardar}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PaymentConfigTypeSection
