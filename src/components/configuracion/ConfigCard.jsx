/**
 * Componente para mostrar una tarjeta de configuración
 */

import Button from '../ui/Button'
import ConfigInput from './ConfigInput'
import { formatearValor } from '../../utils/formatters'
import { validarValor } from '../../utils/validators'

/**
 * Componente para una tarjeta de configuración individual
 * @param {Object} config - Objeto de configuración
 * @param {boolean} isEditando - Indica si está en modo edición
 * @param {any} valorEdicion - Valor actual en edición
 * @param {Function} onEditar - Callback para iniciar edición
 * @param {Function} onCancelar - Callback para cancelar edición
 * @param {Function} onCambioValor - Callback cuando cambia el valor
 * @param {Function} onGuardar - Callback para guardar
 * @param {boolean} estaGuardando - Indica si está guardando
 */
function ConfigCard({ 
  config, 
  isEditando, 
  valorEdicion, 
  onEditar, 
  onCancelar, 
  onCambioValor, 
  onGuardar,
  estaGuardando 
}) {
  const validacion = config.tipoDato === 'number' 
    ? validarValor(valorEdicion, 'number', config.rangoValido)
    : { valido: true }

  return (
    <div className="config-card">
      <div className="config-header">
        <h3 className="config-clave">{config.clave.replace(/_/g, ' ')}</h3>
        {!config.esModificable && (
          <span className="config-badge-readonly">Solo lectura</span>
        )}
      </div>
      
      {config.descripcion && (
        <p className="config-descripcion">{config.descripcion}</p>
      )}

      <div className="config-valor-container">
        <ConfigInput
          config={config}
          value={isEditando ? valorEdicion : config.valor}
          onChange={(newValue) => onCambioValor(config.clave, newValue)}
          validacion={validacion}
          isEditando={isEditando}
        />
      </div>

      {config.esModificable && (
        <div className="config-acciones">
          {isEditando ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onGuardar(config.clave, formatearValor(valorEdicion, config.tipoDato))}
                disabled={!validacion.valido || estaGuardando}
              >
                {estaGuardando ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCancelar(config.clave)}
                disabled={estaGuardando}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onEditar(config.clave, config.valor)}
            >
              Editar
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default ConfigCard
