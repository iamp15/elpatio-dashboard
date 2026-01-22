/**
 * Componente principal para la sección de PaymentConfig
 * Organiza todas las configuraciones por tipo
 */

import { useMemo, useState } from 'react'
import { usePaymentConfig } from '../../hooks/usePaymentConfig'
import PaymentConfigTypeSection from './PaymentConfigTypeSection'
import LoadingSpinner from '../ui/LoadingSpinner'
import Button from '../ui/Button'
import Toast from '../ui/Toast'
import { CONFIG_TYPES } from '../../utils/paymentConfig'
import { initializePaymentConfig } from '../../services/api'
import './PaymentConfigSection.css'

function PaymentConfigSection() {
  const {
    configuraciones,
    loading,
    error,
    handleEditar,
    handleCancelar,
    handleCambioValor,
    handleGuardar,
    getValorEdicion,
    estaEditando,
    estaGuardando,
    refetch,
    toast,
    closeToast
  } = usePaymentConfig()
  
  const [initToast, setInitToast] = useState(null)

  const handleInicializar = async () => {
    try {
      await initializePaymentConfig()
      setInitToast({
        message: 'Configuraciones por defecto inicializadas',
        type: 'success',
        show: true
      })
      refetch()
    } catch (err) {
      console.error('Error inicializando configuraciones:', err)
      setInitToast({
        message: err.message || 'Error al inicializar configuraciones',
        type: 'error',
        show: true
      })
    }
  }
  
  const closeInitToast = () => {
    setInitToast(null)
  }

  // Agrupar configuraciones por tipo
  const configsPorTipo = useMemo(() => {
    const grupos = {
      [CONFIG_TYPES.PRECIOS]: [],
      [CONFIG_TYPES.LIMITES]: [],
      [CONFIG_TYPES.COMISIONES]: [],
      [CONFIG_TYPES.MONEDA]: []
    }

    configuraciones.forEach(config => {
      if (grupos[config.configType]) {
        grupos[config.configType].push(config)
      }
    })

    return grupos
  }, [configuraciones])

  // Métodos del hook para pasar a los componentes hijos
  const hookMethods = {
    handleEditar,
    handleCancelar,
    handleCambioValor,
    handleGuardar,
    getValorEdicion,
    estaEditando,
    estaGuardando
  }

  if (loading) {
    return (
      <div className="payment-config-loading">
        <LoadingSpinner />
        <p>Cargando configuraciones de pagos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="payment-config-error">
        <p>❌ Error: {error}</p>
        <Button onClick={refetch}>Reintentar</Button>
      </div>
    )
  }

  const totalConfigs = configuraciones.length

  return (
    <div className="payment-config-section">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          show={toast.show}
          onClose={closeToast}
          duration={3000}
        />
      )}
      
      {initToast && (
        <Toast
          message={initToast.message}
          type={initToast.type}
          show={initToast.show}
          onClose={closeInitToast}
          duration={3000}
        />
      )}
      
      <div className="payment-config-header">
        <div>
          <h1>Configuraciones de Pagos</h1>
          <p className="payment-config-subtitle">
            Gestiona precios, límites, comisiones y configuración de moneda
          </p>
        </div>
        {totalConfigs > 0 && (
          <div className="payment-config-stats">
            <span>{totalConfigs} configuración{totalConfigs !== 1 ? 'es' : ''} activa{totalConfigs !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {totalConfigs === 0 && (
        <div className="payment-config-empty">
          <p>No hay configuraciones disponibles</p>
          <p className="payment-config-empty-hint">
            Las configuraciones se crearán automáticamente cuando se actualicen por primera vez.
          </p>
          <Button onClick={handleInicializar} variant="primary">
            Inicializar Configuraciones por Defecto
          </Button>
        </div>
      )}

      {totalConfigs > 0 && (
        <div className="payment-config-content">
          <PaymentConfigTypeSection
            configType={CONFIG_TYPES.PRECIOS}
            configs={configsPorTipo[CONFIG_TYPES.PRECIOS]}
            hookMethods={hookMethods}
          />

          <PaymentConfigTypeSection
            configType={CONFIG_TYPES.LIMITES}
            configs={configsPorTipo[CONFIG_TYPES.LIMITES]}
            hookMethods={hookMethods}
          />

          <PaymentConfigTypeSection
            configType={CONFIG_TYPES.COMISIONES}
            configs={configsPorTipo[CONFIG_TYPES.COMISIONES]}
            hookMethods={hookMethods}
          />

          <PaymentConfigTypeSection
            configType={CONFIG_TYPES.MONEDA}
            configs={configsPorTipo[CONFIG_TYPES.MONEDA]}
            hookMethods={hookMethods}
          />
        </div>
      )}
    </div>
  )
}

export default PaymentConfigSection
