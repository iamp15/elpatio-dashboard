/**
 * Componente para renderizar inputs de configuración según su tipo
 */

import { validarValor } from '../../utils/validators'

/**
 * Componente para renderizar inputs según el tipo de dato
 * @param {Object} config - Objeto de configuración
 * @param {any} value - Valor actual
 * @param {Function} onChange - Callback cuando cambia el valor
 * @param {Object} validacion - Objeto con validación (valido, mensaje)
 * @param {boolean} isEditando - Indica si está en modo edición
 */
function ConfigInput({ config, value, onChange, validacion, isEditando }) {
  // Si no es modificable, mostrar valor readonly
  if (!config.esModificable) {
    return (
      <span className="config-valor-readonly">
        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
      </span>
    )
  }

  // Si no está editando, mostrar valor
  if (!isEditando) {
    return (
      <span className="config-valor">
        {typeof value === 'boolean' 
          ? (value ? 'Sí' : 'No') 
          : value}
      </span>
    )
  }

  // Mostrar input según tipo
  if (config.tipoDato === 'boolean') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value === 'true')}
        className="config-input"
      >
        <option value="false">No</option>
        <option value="true">Sí</option>
      </select>
    )
  }

  if (config.tipoDato === 'number') {
    return (
      <div className="config-input-wrapper">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`config-input ${!validacion.valido ? 'config-input-error' : ''}`}
          min={config.rangoValido?.minimo}
          max={config.rangoValido?.maximo}
          step={config.rangoValido ? 0.01 : 1}
        />
        {config.rangoValido && (
          <span className="config-rango-hint">
            ({config.rangoValido.minimo} - {config.rangoValido.maximo})
          </span>
        )}
        {!validacion.valido && (
          <span className="config-error-message">{validacion.mensaje}</span>
        )}
      </div>
    )
  }

  // String por defecto
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="config-input"
    />
  )
}

export default ConfigInput
