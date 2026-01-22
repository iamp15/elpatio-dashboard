/**
 * Sección de gestión de Cajeros
 * Componente wrapper que redirige a la lista de cajeros
 * Ya no se usa directamente, todas las vistas ahora tienen sus propias rutas
 */

import { Navigate } from 'react-router-dom'

function CajerosSection() {
  // Redirigir a la lista de cajeros (que ahora tiene su propia ruta)
  return <Navigate to="/administracion/cajeros" replace />
}

export default CajerosSection
