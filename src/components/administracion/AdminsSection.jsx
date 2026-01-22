/**
 * Sección de gestión de Admins
 * Componente wrapper que redirige a la lista de admins
 * Ya no se usa directamente, todas las vistas ahora tienen sus propias rutas
 */

import { Navigate } from 'react-router-dom'

function AdminsSection() {
  // Redirigir a la lista de admins (que ahora tiene su propia ruta)
  return <Navigate to="/administracion/admins" replace />
}

export default AdminsSection
