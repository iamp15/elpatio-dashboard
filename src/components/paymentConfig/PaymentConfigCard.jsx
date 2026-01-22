/**
 * Componente para mostrar una tarjeta de configuración PaymentConfig
 * Permite editar y guardar configuraciones individuales
 */

import Button from '../ui/Button'
import PaymentConfigInput from './PaymentConfigInput'
import {
  getConfigDescription,
  formatearValorParaUI,
  validarValor,
  requiereConversionMoneda,
  convertirCentavosABolivares
} from '../../utils/paymentConfig'

/**
 * Componente para una tarjeta de configuración PaymentConfig individual
 * @param {Object} props
 * @param {Object} props.config - Objeto de configuración { configType, configKey, configValue }
 * @param {Function} props.onEditar - Callback para iniciar edición
 * @param {Function} props.onCancelar - Callback para cancelar edición
 * @param {Function} props.onCambioValor - Callback cuando cambia el valor
 * @param {Function} props.onGuardar - Callback para guardar
 * @param {boolean} props.isEditando - Indica si está en modo edición
 * @param {any} props.valorEdicion - Valor actual en edición
 * @param {boolean} props.estaGuardando - Indica si está guardando
 */
function PaymentConfigCard({
  config,
  onEditar,
  onCancelar,
  onCambioValor,
  onGuardar,
  isEditando,
  valorEdicion,
  estaGuardando
}) {
  const { configType, configKey, configValue } = config

  // Obtener descripción legible
  const descripcion = getConfigDescription(configKey)

  // Validar valor en edición
  const validacion = isEditando
    ? validarValor(configType, configKey, valorEdicion)
    : { valido: true }

  // Obtener valor formateado para mostrar cuando no está editando
  const valorFormateado = formatearValorParaUI(configType, configKey, configValue)

  const handleGuardar = () => {
    onGuardar(configType, configKey, valorEdicion)
  }

  const handleCancelar = () => {
    onCancelar(configType, configKey)
  }

  const handleEditar = () => {
    // Convertir valor para mostrar en UI si es necesario
    let valorParaUI = configValue
    if (requiereConversionMoneda(configType, configKey)) {
      valorParaUI = convertirCentavosABolivares(configValue)
    }
    onEditar(configType, configKey, valorParaUI)
  }

  return (
    <div className="payment-config-card">
      <div className="payment-config-card-header">
        <h3 className="payment-config-card-title">{descripcion}</h3>
        <span className="payment-config-card-key">{configKey}</span>
      </div>

      <div className="payment-config-card-body">
        <div className="payment-config-valor-container">
          {isEditando ? (
            <PaymentConfigInput
              configType={configType}
              configKey={configKey}
              value={valorEdicion}
              onChange={(newValue) => onCambioValor(configType, configKey, newValue)}
              validacion={validacion}
              isEditando={isEditando}
            />
          ) : (
            <>
              <PaymentConfigInput
                configType={configType}
                configKey={configKey}
                value={valorFormateado}
                onChange={() => {}}
                validacion={validacion}
                isEditando={false}
              />
            </>
          )}
        </div>
      </div>

      <div className="payment-config-card-actions">
        {isEditando ? (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGuardar}
              disabled={!validacion.valido || estaGuardando}
            >
              {estaGuardando ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancelar}
              disabled={estaGuardando}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleEditar}
          >
            Editar
          </Button>
        )}
      </div>
    </div>
  )
}

export default PaymentConfigCard
