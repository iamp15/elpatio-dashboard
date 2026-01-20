/**
 * Componente para las pestañas de transacciones
 * @param {string} activeTab - Pestaña activa
 * @param {Function} onTabChange - Callback cuando cambia la pestaña
 */
function TransaccionesTabs({ activeTab, onTabChange }) {
  return (
    <div className="tabs">
      <button
        className={`tab ${activeTab === 'en-curso' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('en-curso')}
      >
        En Curso
      </button>
      <button
        className={`tab ${activeTab === 'historial' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('historial')}
      >
        Historial
      </button>
    </div>
  )
}

export default TransaccionesTabs
