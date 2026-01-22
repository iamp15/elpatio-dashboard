/**
 * Componente para editar un cajero existente
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCajero } from '../../hooks/useCajero'
import { modificarCajero } from '../../services/api'
import LoadingSpinner from '../ui/LoadingSpinner'
import './CajerosCrear.css'

/**
 * Lista de bancos de Venezuela para el selector
 */
const BANCOS_VENEZUELA = [
  'Banco de Venezuela',
  'Banco Mercantil',
  'Banesco',
  'BBVA Provincial',
  'Banco Exterior',
  'Banco Nacional de Crédito (BNC)',
  'Banco del Tesoro',
  'Banco Bicentenario',
  'Banco Agrícola de Venezuela',
  'Banco Caroní',
  'Banco Sofitasa',
  'Bancrecer',
  'Banco Activo',
  'Banco Plaza',
  'Banco Fondo Común (BFC)',
  '100% Banco',
  'Banplus',
  'Banco del Caribe',
  'Mi Banco',
  'Bancaribe',
]

/**
 * Prefijos de cédula
 */
const PREFIJOS_CEDULA = ['V', 'E', 'J', 'G', 'P']

/**
 * Validar formato de teléfono venezolano
 * Debe tener código de área de 4 dígitos y número de 7 dígitos (total 11 dígitos)
 * @param {string} telefono - Número de teléfono a validar
 * @returns {object} - { valido: boolean, error: string }
 */
const validarTelefono = (telefono) => {
  if (!telefono || !telefono.trim()) {
    return { valido: false, error: 'El teléfono es requerido' }
  }

  // Eliminar espacios, guiones y otros caracteres no numéricos
  const soloNumeros = telefono.replace(/\D/g, '')

  // Verificar que tenga exactamente 11 dígitos
  if (soloNumeros.length !== 11) {
    return { 
      valido: false, 
      error: 'El teléfono debe tener 11 dígitos (4 de código de área + 7 del número)' 
    }
  }

  // Verificar que el código de área tenga 4 dígitos (primeros 4)
  const codigoArea = soloNumeros.substring(0, 4)
  if (codigoArea.length !== 4 || !/^\d{4}$/.test(codigoArea)) {
    return { 
      valido: false, 
      error: 'El código de área debe tener 4 dígitos' 
    }
  }

  // Verificar que el número tenga 7 dígitos (últimos 7)
  const numero = soloNumeros.substring(4)
  if (numero.length !== 7 || !/^\d{7}$/.test(numero)) {
    return { 
      valido: false, 
      error: 'El número debe tener 7 dígitos' 
    }
  }

  return { valido: true, error: '' }
}

/**
 * Estados permitidos para un cajero
 */
const ESTADOS_CAJERO = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'bloqueado', label: 'Bloqueado' },
]

function CajerosEditar() {
  const navigate = useNavigate()
  const { id: cajeroId } = useParams()
  const { cajero, loading: cargando, error: errorCarga } = useCajero(cajeroId)

  const handleVolver = () => {
    navigate('/administracion/cajeros')
  }
  const [formData, setFormData] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const mensajeExitoRef = useRef(null)

  // Cargar datos del cajero en el formulario
  useEffect(() => {
    if (cajero) {
      setFormData({
        nombreCompleto: cajero.nombreCompleto || '',
        email: cajero.email || '',
        password: '',
        confirmarPassword: '',
        telefonoContacto: cajero.telefonoContacto || '',
        foto: cajero.foto || '',
        estado: cajero.estado || 'activo',
        datosPagoMovil: {
          banco: cajero.datosPagoMovil?.banco || '',
          cedula: {
            prefijo: cajero.datosPagoMovil?.cedula?.prefijo || 'V',
            numero: cajero.datosPagoMovil?.cedula?.numero || '',
          },
          telefono: cajero.datosPagoMovil?.telefono || '',
        },
      })
    }
  }, [cajero])

  // Scroll al mensaje de éxito cuando aparezca
  useEffect(() => {
    if (mensajeExito && mensajeExitoRef.current) {
      setTimeout(() => {
        const element = mensajeExitoRef.current
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - 100
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [mensajeExito])

  /**
   * Actualizar campos simples del formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }))
    }
  }

  /**
   * Actualizar campos de datos de pago móvil
   */
  const handlePagoMovilChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      datosPagoMovil: {
        ...prev.datosPagoMovil,
        [name]: value,
      },
    }))
    if (errores[`pagoMovil.${name}`]) {
      setErrores(prev => ({ ...prev, [`pagoMovil.${name}`]: '' }))
    }
  }

  /**
   * Actualizar campos de cédula
   */
  const handleCedulaChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      datosPagoMovil: {
        ...prev.datosPagoMovil,
        cedula: {
          ...prev.datosPagoMovil.cedula,
          [name]: value,
        },
      },
    }))
    if (errores['pagoMovil.cedula']) {
      setErrores(prev => ({ ...prev, 'pagoMovil.cedula': '' }))
    }
  }

  /**
   * Validar formulario
   */
  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.nombreCompleto.trim()) {
      nuevosErrores.nombreCompleto = 'El nombre es requerido'
    }

    // Validar teléfono de contacto
    const validacionTelefonoContacto = validarTelefono(formData.telefonoContacto)
    if (!validacionTelefonoContacto.valido) {
      nuevosErrores.telefonoContacto = validacionTelefonoContacto.error
    }

    // Validar contraseña solo si se está cambiando
    if (formData.password || formData.confirmarPassword) {
      if (!formData.password) {
        nuevosErrores.password = 'La contraseña es requerida si deseas cambiarla'
      } else if (formData.password.length < 6) {
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres'
      }

      if (formData.password !== formData.confirmarPassword) {
        nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden'
      }
    }

    if (!formData.datosPagoMovil.banco) {
      nuevosErrores['pagoMovil.banco'] = 'El banco es requerido'
    }

    if (!formData.datosPagoMovil.cedula.numero.trim()) {
      nuevosErrores['pagoMovil.cedula'] = 'El número de cédula es requerido'
    }

    // Validar teléfono de pago móvil
    const validacionTelefonoPago = validarTelefono(formData.datosPagoMovil.telefono)
    if (!validacionTelefonoPago.valido) {
      nuevosErrores['pagoMovil.telefono'] = validacionTelefonoPago.error
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  /**
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensajeExito('')

    if (!validarFormulario()) {
      return
    }

    setGuardando(true)

    try {
      const datosEnviar = {
        nombreCompleto: formData.nombreCompleto.trim(),
        telefonoContacto: formData.telefonoContacto.trim(),
        estado: formData.estado,
        datosPagoMovil: {
          banco: formData.datosPagoMovil.banco,
          cedula: {
            prefijo: formData.datosPagoMovil.cedula.prefijo,
            numero: formData.datosPagoMovil.cedula.numero.trim(),
          },
          telefono: formData.datosPagoMovil.telefono.trim(),
        },
      }

      // Agregar foto solo si se proporcionó
      if (formData.foto.trim()) {
        datosEnviar.foto = formData.foto.trim()
      }

      // Agregar contraseña solo si se está cambiando
      if (formData.password) {
        datosEnviar.password = formData.password
      }

      await modificarCajero(cajeroId, datosEnviar)
      setMensajeExito(`¡Cajero "${formData.nombreCompleto}" modificado exitosamente!`)
    } catch (error) {
      setErrores({ general: error.message || 'Error al modificar el cajero' })
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="cajeros-crear">
        <div className="crear-header">
          <button onClick={onVolver} className="btn-volver">
            ← Volver
          </button>
          <h3>Editar Cajero</h3>
        </div>
        <div className="cajeros-lista-loading">
          <LoadingSpinner />
          <p>Cargando datos del cajero...</p>
        </div>
      </div>
    )
  }

  if (errorCarga) {
    return (
      <div className="cajeros-crear">
        <div className="crear-header">
          <button onClick={onVolver} className="btn-volver">
            ← Volver
          </button>
          <h3>Editar Cajero</h3>
        </div>
        <div className="cajeros-lista-error">
          <p>Error al cargar el cajero: {errorCarga}</p>
          <button onClick={onVolver} className="btn-retry">
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (!formData) {
    return null
  }

  return (
    <div className="cajeros-crear">
      <div className="crear-header">
        <button onClick={handleVolver} className="btn-volver">
          ← Volver
        </button>
        <h3>Editar Cajero</h3>
      </div>

      {mensajeExito && (
        <div className="mensaje-exito" ref={mensajeExitoRef}>
          <span>✅ {mensajeExito}</span>
          <div className="mensaje-exito-acciones">
            <button 
              type="button" 
              className="btn-link"
              onClick={() => setMensajeExito('')}
            >
              Continuar editando
            </button>
            <button 
              type="button" 
              className="btn-link"
              onClick={handleVolver}
            >
              Volver a la lista
            </button>
          </div>
        </div>
      )}

      {errores.general && (
        <div className="mensaje-error-general">
          ❌ {errores.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="crear-form">
        {/* Sección: Información del Sistema (solo lectura) */}
        <fieldset className="form-seccion">
          <legend>Información del Sistema</legend>
          
          <div className="form-grupo">
            <label htmlFor="id">ID del Cajero</label>
            <input
              type="text"
              id="id"
              value={cajero?._id || ''}
              disabled
              className="input-readonly"
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="input-readonly"
            />
            <span className="hint-text">El email no se puede modificar</span>
          </div>
        </fieldset>

        {/* Sección: Datos Personales */}
        <fieldset className="form-seccion">
          <legend>Datos Personales</legend>
          
          <div className="form-grupo">
            <label htmlFor="nombreCompleto">Nombre Completo *</label>
            <input
              type="text"
              id="nombreCompleto"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              className={errores.nombreCompleto ? 'input-error' : ''}
            />
            {errores.nombreCompleto && (
              <span className="error-texto">{errores.nombreCompleto}</span>
            )}
          </div>

          <div className="form-grupo">
            <label htmlFor="telefonoContacto">Teléfono de Contacto *</label>
            <input
              type="tel"
              id="telefonoContacto"
              name="telefonoContacto"
              value={formData.telefonoContacto}
              onChange={handleChange}
              placeholder="Ej: 04141234567"
              className={errores.telefonoContacto ? 'input-error' : ''}
            />
            {errores.telefonoContacto && (
              <span className="error-texto">{errores.telefonoContacto}</span>
            )}
          </div>

          <div className="form-grupo">
            <label htmlFor="foto">URL de Foto (opcional)</label>
            <input
              type="url"
              id="foto"
              name="foto"
              value={formData.foto}
              onChange={handleChange}
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="estado">Estado *</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              {ESTADOS_CAJERO.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Sección: Credenciales de Acceso */}
        <fieldset className="form-seccion">
          <legend>Credenciales de Acceso (Opcional)</legend>
          <p className="hint-text">Deja estos campos vacíos si no deseas cambiar la contraseña</p>
          
          <div className="form-fila">
            <div className="form-grupo">
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={errores.password ? 'input-error' : ''}
              />
              {errores.password && (
                <span className="error-texto">{errores.password}</span>
              )}
            </div>

            <div className="form-grupo">
              <label htmlFor="confirmarPassword">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                id="confirmarPassword"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                placeholder="Repetir contraseña"
                className={errores.confirmarPassword ? 'input-error' : ''}
              />
              {errores.confirmarPassword && (
                <span className="error-texto">{errores.confirmarPassword}</span>
              )}
            </div>
          </div>
        </fieldset>

        {/* Sección: Datos de Pago Móvil */}
        <fieldset className="form-seccion">
          <legend>Datos de Pago Móvil</legend>
          
          <div className="form-grupo">
            <label htmlFor="banco">Banco *</label>
            <select
              id="banco"
              name="banco"
              value={formData.datosPagoMovil.banco}
              onChange={handlePagoMovilChange}
              className={errores['pagoMovil.banco'] ? 'input-error' : ''}
            >
              <option value="">Seleccionar banco...</option>
              {BANCOS_VENEZUELA.map(banco => (
                <option key={banco} value={banco}>{banco}</option>
              ))}
            </select>
            {errores['pagoMovil.banco'] && (
              <span className="error-texto">{errores['pagoMovil.banco']}</span>
            )}
          </div>

          <div className="form-grupo">
            <label>Cédula de Identidad *</label>
            <div className="cedula-input">
              <select
                name="prefijo"
                value={formData.datosPagoMovil.cedula.prefijo}
                onChange={handleCedulaChange}
                className="cedula-prefijo"
              >
                {PREFIJOS_CEDULA.map(prefijo => (
                  <option key={prefijo} value={prefijo}>{prefijo}</option>
                ))}
              </select>
              <input
                type="text"
                name="numero"
                value={formData.datosPagoMovil.cedula.numero}
                onChange={handleCedulaChange}
                placeholder="12345678"
                className={`cedula-numero ${errores['pagoMovil.cedula'] ? 'input-error' : ''}`}
              />
            </div>
            {errores['pagoMovil.cedula'] && (
              <span className="error-texto">{errores['pagoMovil.cedula']}</span>
            )}
          </div>

          <div className="form-grupo">
            <label htmlFor="telefonoPago">Teléfono Pago Móvil *</label>
            <input
              type="tel"
              id="telefonoPago"
              name="telefono"
              value={formData.datosPagoMovil.telefono}
              onChange={handlePagoMovilChange}
              placeholder="04121234567"
              className={errores['pagoMovil.telefono'] ? 'input-error' : ''}
            />
            {errores['pagoMovil.telefono'] && (
              <span className="error-texto">{errores['pagoMovil.telefono']}</span>
            )}
          </div>
        </fieldset>

        {/* Botones de acción */}
        <div className="form-acciones">
          <button
            type="button"
            onClick={handleVolver}
            className="btn-secundario"
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primario"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CajerosEditar
