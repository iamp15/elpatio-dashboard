import './Card.css'

function Card({ title, value, icon, highlight = false }) {
  return (
    <div className={`card ${highlight ? 'card-highlight' : ''}`}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  )
}

export default Card
