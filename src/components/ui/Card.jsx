import './Card.css'

/**
 * Componente Card reutilizable
 * Puede usarse de dos formas:
 * 1. Con props title/value/icon para tarjetas de estadísticas
 * 2. Con children para contenedor genérico
 */
function Card({ title, value, icon, highlight = false, children, className = '' }) {
  // Si tiene children, renderiza como contenedor genérico
  if (children) {
    return (
      <div className={`card card-container ${highlight ? 'card-highlight' : ''} ${className}`}>
        {children}
      </div>
    )
  }

  // Formato original para tarjetas de estadísticas
  return (
    <div className={`card ${highlight ? 'card-highlight' : ''} ${className}`}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  )
}

export default Card
