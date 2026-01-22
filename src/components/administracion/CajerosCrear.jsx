/**
 * Componente para crear un nuevo cajero
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearCajero } from '../../services/api'
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
 * Estado inicial del formulario
 */
const FORM_INICIAL = {
  nombreCompleto: '',
  email: '',
  password: '',
  confirmarPassword: '',
  telefonoContacto: '',
  foto: '',
  datosPagoMovil: {
    banco: '',
    cedula: {
      prefijo: 'V',
      numero: '',
    },
    telefono: '',
  },
}

function CajerosCrear() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const mensajeExitoRef = useRef(null)

  const handleVolver = () => {
    navigate('/administracion/cajeros')
  }

  // Scroll al mensaje de éxito cuando aparezca
  useEffect(() => {
    if (mensajeExito && mensajeExitoRef.current) {
      // Pequeño delay para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        const element = mensajeExitoRef.current
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - 100 // 100px de espacio arriba
        
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
    // Limpiar error del campo al modificarlo
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

    // Validar nombre
    if (!formData.nombreCompleto.trim()) {
      nuevosErrores.nombreCompleto = 'El nombre es requerido'
    }

    // Validar email
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'El email no es válido'
    }

    // Validar contraseña
    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden'
    }

    // Validar teléfono de contacto
    const validacionTelefonoContacto = validarTelefono(formData.telefonoContacto)
    if (!validacionTelefonoContacto.valido) {
      nuevosErrores.telefonoContacto = validacionTelefonoContacto.error
    }

    // Validar datos de pago móvil
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
      // Preparar datos para enviar (sin confirmarPassword)
      const datosEnviar = {
        nombreCompleto: formData.nombreCompleto.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        telefonoContacto: formData.telefonoContacto.trim(),
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

      const resultado = await crearCajero(datosEnviar)
      setMensajeExito(`¡Cajero "${resultado.cajero?.nombreCompleto || formData.nombreCompleto}" creado exitosamente!`)
      setFormData(FORM_INICIAL)
    } catch (error) {
      setErrores({ general: error.message || 'Error al crear el cajero' })
    } finally {
      setGuardando(false)
    }
  }

  /**
   * Limpiar formulario
   */
  const handleLimpiar = () => {
    setFormData(FORM_INICIAL)
    setErrores({})
    setMensajeExito('')
  }

  return (
    <div className="cajeros-crear">
      <div className="crear-header">
        <button onClick={handleVolver} className="btn-volver">
          ← Volver
        </button>
        <h3>Agregar Cajero Nuevo</h3>
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
              Crear otro
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
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: juan@email.com"
              autoComplete="off"
              className={errores.email ? 'input-error' : ''}
            />
            {errores.email && (
              <span className="error-texto">{errores.email}</span>
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
        </fieldset>

        {/* Sección: Credenciales */}
        <fieldset className="form-seccion">
          <legend>Credenciales de Acceso</legend>
          
          <div className="form-fila">
            <div className="form-grupo">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                className={errores.password ? 'input-error' : ''}
              />
              {errores.password && (
                <span className="error-texto">{errores.password}</span>
              )}
            </div>

            <div className="form-grupo">
              <label htmlFor="confirmarPassword">Confirmar Contraseña *</label>
              <input
                type="password"
                id="confirmarPassword"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                placeholder="Repetir contraseña"
                autoComplete="new-password"
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
            onClick={handleLimpiar}
            className="btn-secundario"
            disabled={guardando}
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="btn-primario"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Crear Cajero'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CajerosCrear
