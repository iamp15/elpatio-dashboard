/**
 * Hook para gestionar filtros y paginación de transacciones
 */

import { useState } from 'react'

/**
 * Hook para gestionar filtros y paginación
 * @returns {Object} Estado y funciones para filtros y paginación
 */
export function useTransaccionesFilters() {
  const [filtros, setFiltros] = useState({
    tipo: '',
    categoria: '',
    estado: '',
    fechaInicio: '',
    fechaFin: '',
    pagina: 1,
    limite: 20,
  })

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      pagina: key !== 'pagina' ? 1 : prev.pagina, // Resetear página al cambiar otros filtros
    }))
  }

  const handlePaginaChange = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: nuevaPagina }))
  }

  return {
    filtros,
    handleFiltroChange,
    handlePaginaChange,
  }
}
