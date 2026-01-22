/**
 * Componente para crear un nuevo admin
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearAdmin } from '../../services/api'
import './AdminsCrear.css'

/**
 * Roles permitidos para crear (según el backend)
 */
const ROLES_PERMITIDOS = [
  { value: 'admin', label: 'Admin' },
  { value: 'moderador', label: 'Moderador' },
]

/**
 * Estado inicial del formulario
 */
const FORM_INICIAL = {
  nombreCompleto: '',
  email: '',
  password: '',
  confirmarPassword: '',
  rol: 'admin',
}

function AdminsCrear() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const mensajeExitoRef = useRef(null)

  const handleVolver = () => {
    navigate('/administracion/admins')
  }

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
   * Actualizar campos del formulario
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
   * Validar formulario
   */
  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.nombreCompleto.trim()) {
      nuevosErrores.nombreCompleto = 'El nombre es requerido'
    }

    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'El email no es válido'
    }

    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.password !== formData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden'
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
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rol: formData.rol,
      }

      const resultado = await crearAdmin(datosEnviar)
      setMensajeExito(`¡Admin "${resultado.admin?.nombreCompleto || formData.nombreCompleto}" creado exitosamente!`)
      setFormData(FORM_INICIAL)
    } catch (error) {
      setErrores({ general: error.message || 'Error al crear el admin' })
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
    <div className="admins-crear">
      <div className="crear-header">
        <button onClick={handleVolver} className="btn-volver">
          ← Volver
        </button>
        <h3>Agregar Admin Nuevo</h3>
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
              autoComplete="off"
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
            <label htmlFor="rol">Rol *</label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
            >
              {ROLES_PERMITIDOS.map(rol => (
                <option key={rol.value} value={rol.value}>{rol.label}</option>
              ))}
            </select>
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
            {guardando ? 'Guardando...' : 'Crear Admin'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminsCrear
