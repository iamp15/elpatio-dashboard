import { useState, useEffect } from 'react'
import { getAllConfigs, updateConfig } from '../services/api'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import './Configuracion.css'

function Configuracion() {
  const [configuraciones, setConfiguraciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editando, setEditando] = useState({}) // { clave: valor }
  const [guardando, setGuardando] = useState({}) // { clave: true/false }

  useEffect(() => {
    cargarConfiguraciones()
  }, [])

  const cargarConfiguraciones = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllConfigs()
      // La API retorna { ok: true, configuraciones: [...] }
      setConfiguraciones(data.configuraciones || [])
    } catch (err) {
      console.error('Error cargando configuraciones:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = (clave, valorActual) => {
    setEditando(prev => ({
      ...prev,
      [clave]: valorActual,
    }))
  }

  const handleCancelar = (clave) => {
    const nuevasEdiciones = { ...editando }
    delete nuevasEdiciones[clave]
    setEditando(nuevasEdiciones)
  }

  const handleCambioValor = (clave, nuevoValor) => {
    setEditando(prev => ({
      ...prev,
      [clave]: nuevoValor,
    }))
  }

  const handleGuardar = async (clave, valor) => {
    try {
      setGuardando(prev => ({ ...prev, [clave]: true }))
      await updateConfig(clave, valor)
      
      // Actualizar la lista de configuraciones
      const nuevasConfiguraciones = configuraciones.map(config => 
        config.clave === clave ? { ...config, valor } : config
      )
      setConfiguraciones(nuevasConfiguraciones)
      
      // Remover de editando
      handleCancelar(clave)
      
      // Mostrar mensaje de éxito
      alert('✅ Configuración actualizada correctamente')
    } catch (err) {
      console.error('Error guardando configuración:', err)
      alert(`❌ Error al guardar: ${err.message}`)
    } finally {
      setGuardando(prev => ({ ...prev, [clave]: false }))
    }
  }

  const formatearValor = (valor, tipoDato) => {
    if (tipoDato === 'number') {
      return typeof valor === 'number' ? valor : parseFloat(valor) || 0
    }
    if (tipoDato === 'boolean') {
      return typeof valor === 'boolean' ? valor : valor === 'true' || valor === true
    }
    return valor
  }

  const validarValor = (valor, tipoDato, rangoValido) => {
    if (tipoDato === 'number') {
      const numValor = parseFloat(valor)
      if (isNaN(numValor)) return { valido: false, mensaje: 'Debe ser un número' }
      
      if (rangoValido?.minimo !== undefined && numValor < rangoValido.minimo) {
        return { 
          valido: false, 
          mensaje: `El valor mínimo es ${rangoValido.minimo}` 
        }
      }
      
      if (rangoValido?.maximo !== undefined && numValor > rangoValido.maximo) {
        return { 
          valido: false, 
          mensaje: `El valor máximo es ${rangoValido.maximo}` 
        }
      }
    }
    return { valido: true }
  }

  const configuracionesPorCategoria = configuraciones.reduce((acc, config) => {
    const categoria = config.categoria || 'general'
    if (!acc[categoria]) acc[categoria] = []
    acc[categoria].push(config)
    return acc
  }, {})

  const getCategoriaLabel = (categoria) => {
    const labels = {
      depositos: 'Depósitos',
      retiros: 'Retiros',
      general: 'General',
      notificaciones: 'Notificaciones',
      seguridad: 'Seguridad',
    }
    return labels[categoria] || categoria
  }

  const renderInput = (config) => {
    const estaEditando = editando.hasOwnProperty(config.clave)
    const valorEdicion = editando[config.clave] !== undefined 
      ? editando[config.clave] 
      : config.valor

    if (!estaEditando && !config.esModificable) {
      return (
        <span className="config-valor-readonly">
          {typeof config.valor === 'boolean' ? (config.valor ? 'Sí' : 'No') : config.valor}
        </span>
      )
    }

    if (!estaEditando) {
      return (
        <span className="config-valor">
          {typeof config.valor === 'boolean' 
            ? (config.valor ? 'Sí' : 'No') 
            : config.valor}
        </span>
      )
    }

    // Mostrar input según tipo
    if (config.tipoDato === 'boolean') {
      return (
        <select
          value={valorEdicion}
          onChange={(e) => handleCambioValor(config.clave, e.target.value === 'true')}
          className="config-input"
        >
          <option value="false">No</option>
          <option value="true">Sí</option>
        </select>
      )
    }

    if (config.tipoDato === 'number') {
      const validacion = validarValor(valorEdicion, 'number', config.rangoValido)
      return (
        <div className="config-input-wrapper">
          <input
            type="number"
            value={valorEdicion}
            onChange={(e) => handleCambioValor(config.clave, e.target.value)}
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
        value={valorEdicion}
        onChange={(e) => handleCambioValor(config.clave, e.target.value)}
        className="config-input"
      />
    )
  }

  if (loading) {
    return (
      <div className="configuracion-loading">
        <LoadingSpinner />
        <p>Cargando configuraciones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="configuracion-error">
        <p>❌ Error: {error}</p>
        <Button onClick={cargarConfiguraciones}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="configuracion-page">
      <div className="page-header">
        <h1>Configuración del Sistema</h1>
        <p className="page-subtitle">
          Gestiona los parámetros de configuración del sistema
        </p>
      </div>

      {Object.keys(configuracionesPorCategoria).length === 0 && (
        <div className="empty-state">
          <p>No hay configuraciones disponibles</p>
        </div>
      )}

      {Object.entries(configuracionesPorCategoria).map(([categoria, configs]) => (
        <div key={categoria} className="config-categoria">
          <h2 className="categoria-title">{getCategoriaLabel(categoria)}</h2>
          <div className="config-grid">
            {configs.map((config) => {
              const estaEditando = editando.hasOwnProperty(config.clave)
              const estaGuardando = guardando[config.clave]
              const valorEdicion = editando[config.clave] !== undefined 
                ? editando[config.clave] 
                : config.valor
              const validacion = config.tipoDato === 'number' 
                ? validarValor(valorEdicion, 'number', config.rangoValido)
                : { valido: true }

              return (
                <div key={config.clave} className="config-card">
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
                    {renderInput(config)}
                  </div>

                  {config.esModificable && (
                    <div className="config-acciones">
                      {estaEditando ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleGuardar(config.clave, formatearValor(valorEdicion, config.tipoDato))}
                            disabled={!validacion.valido || estaGuardando}
                          >
                            {estaGuardando ? 'Guardando...' : 'Guardar'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCancelar(config.clave)}
                            disabled={estaGuardando}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEditar(config.clave, config.valor)}
                        >
                          Editar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Configuracion
