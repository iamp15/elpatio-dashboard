import './Table.css'

function Table({ children, className = '' }) {
  return (
    <div className="table-container">
      <table className={`table ${className}`}>
        {children}
      </table>
    </div>
  )
}

Table.Head = function TableHead({ children }) {
  return <thead className="table-head">{children}</thead>
}

Table.Body = function TableBody({ children }) {
  return <tbody className="table-body">{children}</tbody>
}

Table.Row = function TableRow({ children, onClick, className = '' }) {
  return (
    <tr 
      className={`table-row ${onClick ? 'table-row-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

Table.Header = function TableHeader({ children, className = '' }) {
  return <th className={`table-header ${className}`}>{children}</th>
}

Table.Cell = function TableCell({ children, className = '' }) {
  return <td className={`table-cell ${className}`}>{children}</td>
}

export default Table
