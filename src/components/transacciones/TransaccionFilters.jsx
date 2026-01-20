/**
 * Componente para los filtros de transacciones
 * @param {Object} filtros - Objeto con los filtros actuales
 * @param {Function} onFiltroChange - Callback cuando cambia un filtro
 */
function TransaccionFilters({ filtros, onFiltroChange }) {
  return (
    <div className="filtros-container">
      <div className="filtros-grid">
        <div className="filtro-group">
          <label>Tipo</label>
          <select
            value={filtros.tipo}
            onChange={(e) => onFiltroChange('tipo', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="debito">Débito</option>
            <option value="credito">Crédito</option>
          </select>
        </div>
        <div className="filtro-group">
          <label>Categoría</label>
          <select
            value={filtros.categoria}
            onChange={(e) => onFiltroChange('categoria', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="deposito">Depósito</option>
            <option value="retiro">Retiro</option>
            <option value="entrada_sala">Entrada Sala</option>
            <option value="premio_juego">Premio Juego</option>
            <option value="reembolso">Reembolso</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <div className="filtro-group">
          <label>Estado</label>
          <select
            value={filtros.estado}
            onChange={(e) => onFiltroChange('estado', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completada">Completada</option>
            <option value="rechazada">Rechazada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div className="filtro-group">
          <label>Fecha Inicio</label>
          <input
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => onFiltroChange('fechaInicio', e.target.value)}
          />
        </div>
        <div className="filtro-group">
          <label>Fecha Fin</label>
          <input
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => onFiltroChange('fechaFin', e.target.value)}
          />
        </div>
        <div className="filtro-group">
          <label>Registros por página</label>
          <select
            value={filtros.limite}
            onChange={(e) => onFiltroChange('limite', parseInt(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default TransaccionFilters
