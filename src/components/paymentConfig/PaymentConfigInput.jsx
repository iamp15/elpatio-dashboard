/**
 * Componente para renderizar inputs de PaymentConfig según su tipo
 * Maneja conversión de valores y validación
 */

import {
  requiereConversionMoneda,
  esPorcentaje,
  esCantidad,
  getInputType,
  getInputPlaceholder
} from '../../utils/paymentConfig'

/**
 * Componente para renderizar inputs según el tipo de configuración
 * @param {Object} props
 * @param {string} props.configType - Tipo de configuración (precios, limites, comisiones, moneda)
 * @param {string} props.configKey - Clave de configuración
 * @param {any} props.value - Valor actual
 * @param {Function} props.onChange - Callback cuando cambia el valor
 * @param {Object} props.validacion - Objeto con validación (valido, mensaje)
 * @param {boolean} props.isEditando - Indica si está en modo edición
 */
function PaymentConfigInput({
  configType,
  configKey,
  value,
  onChange,
  validacion,
  isEditando
}) {
  // Si no está editando, mostrar valor formateado
  if (!isEditando) {
    // El valor ya viene formateado desde PaymentConfigCard
    return (
      <span className="payment-config-valor">
        {value !== null && value !== undefined ? String(value) : '-'}
      </span>
    )
  }

  const inputType = getInputType(configType, configKey)
  const placeholder = getInputPlaceholder(configType, configKey)
  const esMonetario = requiereConversionMoneda(configType, configKey)
  const esPorcentajeValue = esPorcentaje(configType, configKey)
  const esCantidadValue = esCantidad(configType, configKey)

  // Input numérico para valores monetarios
  if (esMonetario) {
    return (
      <div className="payment-config-input-wrapper">
        <div className="payment-config-input-group">
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`payment-config-input ${!validacion?.valido ? 'payment-config-input-error' : ''}`}
            placeholder={placeholder}
            min="0"
            step="1"
          />
          <span className="payment-config-input-suffix">Bs</span>
        </div>
        {!validacion?.valido && validacion?.mensaje && (
          <span className="payment-config-error-message">{validacion.mensaje}</span>
        )}
        <span className="payment-config-hint">
          Valor en bolívares (se convertirá a centavos automáticamente)
        </span>
      </div>
    )
  }

  // Input numérico para porcentajes
  if (esPorcentajeValue) {
    return (
      <div className="payment-config-input-wrapper">
        <div className="payment-config-input-group">
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`payment-config-input ${!validacion?.valido ? 'payment-config-input-error' : ''}`}
            placeholder={placeholder}
            min="0"
            max="100"
            step="0.1"
          />
          <span className="payment-config-input-suffix">%</span>
        </div>
        {!validacion?.valido && validacion?.mensaje && (
          <span className="payment-config-error-message">{validacion.mensaje}</span>
        )}
      </div>
    )
  }

  // Input numérico para cantidades
  if (esCantidadValue) {
    // Verificar si es un timeout de depósito para mostrar sufijo "minutos"
    const esTimeout = configKey.startsWith('deposito.timeout.')
    
    return (
      <div className="payment-config-input-wrapper">
        <div className="payment-config-input-group">
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`payment-config-input ${!validacion?.valido ? 'payment-config-input-error' : ''}`}
            placeholder={placeholder}
            min="1"
            step="1"
          />
          {esTimeout && (
            <span className="payment-config-input-suffix">min</span>
          )}
        </div>
        {!validacion?.valido && validacion?.mensaje && (
          <span className="payment-config-error-message">{validacion.mensaje}</span>
        )}
      </div>
    )
  }

  // Input de texto para moneda (código, símbolo, formato)
  if (inputType === 'text') {
    return (
      <div className="payment-config-input-wrapper">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`payment-config-input ${!validacion?.valido ? 'payment-config-input-error' : ''}`}
          placeholder={placeholder}
        />
        {!validacion?.valido && validacion?.mensaje && (
          <span className="payment-config-error-message">{validacion.mensaje}</span>
        )}
      </div>
    )
  }

  // Input numérico por defecto
  return (
    <div className="payment-config-input-wrapper">
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`payment-config-input ${!validacion?.valido ? 'payment-config-input-error' : ''}`}
        placeholder={placeholder}
      />
      {!validacion?.valido && validacion?.mensaje && (
        <span className="payment-config-error-message">{validacion.mensaje}</span>
      )}
    </div>
  )
}

export default PaymentConfigInput
