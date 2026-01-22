/**
 * Componente para editar un admin existente
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAdmin } from '../../hooks/useAdmin'
import { modificarAdmin } from '../../services/api'
import LoadingSpinner from '../ui/LoadingSpinner'
import './AdminsCrear.css'

/**
 * Roles permitidos para editar
 */
const ROLES_PERMITIDOS = [
  { value: 'admin', label: 'Admin' },
  { value: 'moderador', label: 'Moderador' },
]

/**
 * Estados permitidos para un admin
 */
const ESTADOS_ADMIN = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

function AdminsEditar() {
  const navigate = useNavigate()
  const { id: adminId } = useParams()
  const { admin, loading: cargando, error: errorCarga } = useAdmin(adminId)
  const [formData, setFormData] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const mensajeExitoRef = useRef(null)

  // Cargar datos del admin en el formulario
  useEffect(() => {
    if (admin) {
      setFormData({
        nombreCompleto: admin.nombreCompleto || '',
        email: admin.email || '',
        password: '',
        confirmarPassword: '',
        rol: admin.rol || 'admin',
        estado: admin.estado || 'activo',
      })
    }
  }, [admin])

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

  const handleVolver = () => {
    navigate('/administracion/admins')
  }

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
        rol: formData.rol,
        estado: formData.estado,
      }

      // Agregar contraseña solo si se está cambiando
      if (formData.password) {
        datosEnviar.password = formData.password
      }

      await modificarAdmin(adminId, datosEnviar)
      setMensajeExito(`¡Admin "${formData.nombreCompleto}" modificado exitosamente!`)
    } catch (error) {
      setErrores({ general: error.message || 'Error al modificar el admin' })
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="admins-crear">
        <div className="crear-header">
          <button onClick={handleVolver} className="btn-volver">
            ← Volver
          </button>
          <h3>Editar Admin</h3>
        </div>
        <div className="cajeros-lista-loading">
          <LoadingSpinner />
          <p>Cargando datos del admin...</p>
        </div>
      </div>
    )
  }

  if (errorCarga) {
    return (
      <div className="admins-crear">
        <div className="crear-header">
          <button onClick={handleVolver} className="btn-volver">
            ← Volver
          </button>
          <h3>Editar Admin</h3>
        </div>
        <div className="cajeros-lista-error">
          <p>Error al cargar el admin: {errorCarga}</p>
          <button onClick={handleVolver} className="btn-retry">
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
    <div className="admins-crear">
      <div className="crear-header">
        <button onClick={handleVolver} className="btn-volver">
          ← Volver
        </button>
        <h3>Editar Admin</h3>
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
            <label htmlFor="id">ID del Admin</label>
            <input
              type="text"
              id="id"
              value={admin?._id || ''}
              disabled
              className="input-readonly"
            />
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

          <div className="form-grupo">
            <label htmlFor="estado">Estado *</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              {ESTADOS_ADMIN.map(estado => (
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
                autoComplete="new-password"
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

export default AdminsEditar
