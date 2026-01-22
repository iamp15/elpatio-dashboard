import { useState, useMemo } from 'react'
import { useConfiguraciones } from '../hooks/useConfiguraciones'
import { getCategoriaLabel } from '../utils/constants'
import ConfigCard from '../components/configuracion/ConfigCard'
import PaymentConfigSection from '../components/paymentConfig/PaymentConfigSection'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import './Configuracion.css'

function Configuracion() {
  const [tabActivo, setTabActivo] = useState('generales') // 'generales' o 'pagos'

  const {
    configuraciones,
    loading,
    error,
    editando,
    guardando,
    handleEditar,
    handleCancelar,
    handleCambioValor,
    handleGuardar,
    refetch,
  } = useConfiguraciones()

  const configuracionesPorCategoria = useMemo(() => {
    return configuraciones.reduce((acc, config) => {
      const categoria = config.categoria || 'general'
      if (!acc[categoria]) acc[categoria] = []
      acc[categoria].push(config)
      return acc
    }, {})
  }, [configuraciones])

  // Renderizar contenido según el tab activo
  const renderContenido = () => {
    if (tabActivo === 'pagos') {
      return <PaymentConfigSection />
    }

    // Tab de configuraciones generales
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
          <Button onClick={refetch}>Reintentar</Button>
        </div>
      )
    }

    return (
      <>
        {Object.keys(configuracionesPorCategoria).length === 0 && (
          <div className="empty-state">
            <p>No hay configuraciones disponibles</p>
          </div>
        )}

        {Object.entries(configuracionesPorCategoria).map(([categoria, configs]) => (
          <div key={categoria} className="config-categoria">
            <h2 className="categoria-title">{getCategoriaLabel(categoria)}</h2>
            <div className="config-grid">
              {configs.map((config) => (
                <ConfigCard
                  key={config.clave}
                  config={config}
                  isEditando={editando.hasOwnProperty(config.clave)}
                  valorEdicion={editando[config.clave] !== undefined 
                    ? editando[config.clave] 
                    : config.valor}
                  onEditar={handleEditar}
                  onCancelar={handleCancelar}
                  onCambioValor={handleCambioValor}
                  onGuardar={handleGuardar}
                  estaGuardando={guardando[config.clave]}
                />
              ))}
            </div>
          </div>
        ))}
      </>
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

      {/* Tabs */}
      <div className="configuracion-tabs">
        <button
          className={`configuracion-tab ${tabActivo === 'generales' ? 'configuracion-tab-active' : ''}`}
          onClick={() => setTabActivo('generales')}
        >
          Configuraciones Generales
        </button>
        <button
          className={`configuracion-tab ${tabActivo === 'pagos' ? 'configuracion-tab-active' : ''}`}
          onClick={() => setTabActivo('pagos')}
        >
          Configuraciones de Pagos
        </button>
      </div>

      {/* Contenido del tab activo */}
      <div className="configuracion-tab-content">
        {renderContenido()}
      </div>
    </div>
  )
}

export default Configuracion
