/**
 * Componente para mostrar la lista de transacciones
 */

import Table from '../ui/Table'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatCurrency, formatDate, getBadgeVariant, formatEstado } from '../../utils/formatters'

/**
 * Componente para mostrar la lista de transacciones
 * @param {Array} transacciones - Array de transacciones
 * @param {Function} onVerDetalles - Callback cuando se hace clic en ver detalles
 */
function TransaccionesList({ transacciones, onVerDetalles }) {
  if (transacciones.length === 0) {
    return null
  }

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.Header>ID</Table.Header>
          <Table.Header>Jugador</Table.Header>
          <Table.Header>Tipo</Table.Header>
          <Table.Header>Categoría</Table.Header>
          <Table.Header>Monto</Table.Header>
          <Table.Header>Estado</Table.Header>
          <Table.Header>Fecha</Table.Header>
          <Table.Header>Acciones</Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {transacciones.map((trans) => (
          <Table.Row key={trans._id}>
            <Table.Cell>{trans._id.slice(-8)}</Table.Cell>
            <Table.Cell>
              {trans.jugadorId?.username || trans.jugadorId?.telegramId || '-'}
            </Table.Cell>
            <Table.Cell>
              <Badge variant={trans.tipo === 'credito' ? 'success' : 'danger'}>
                {trans.tipo}
              </Badge>
            </Table.Cell>
            <Table.Cell>{trans.categoria.replace('_', ' ')}</Table.Cell>
            <Table.Cell className="text-right">{formatCurrency(trans.monto)}</Table.Cell>
            <Table.Cell>
              <Badge variant={getBadgeVariant(trans.estado)}>
                {formatEstado(trans.estado)}
              </Badge>
            </Table.Cell>
            <Table.Cell>{formatDate(trans.createdAt)}</Table.Cell>
            <Table.Cell>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onVerDetalles(trans._id)}
              >
                Ver
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default TransaccionesList
