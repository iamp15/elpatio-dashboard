/**
 * Funciones de validación
 * Centraliza todas las funciones de validación utilizadas en la aplicación
 */

/**
 * Valida un valor según su tipo de dato y rango válido
 * @param {any} valor - Valor a validar
 * @param {string} tipoDato - Tipo de dato ('number', 'boolean', 'string')
 * @param {Object} rangoValido - Objeto con propiedades minimo y/o maximo (solo para números)
 * @returns {Object} Objeto con propiedades valido (boolean) y mensaje (string) si no es válido
 */
export function validarValor(valor, tipoDato, rangoValido) {
  if (tipoDato === 'number') {
    const numValor = parseFloat(valor)
    if (isNaN(numValor)) return { valido: false, mensaje: 'Debe ser un número' }
    
    if (rangoValido?.minimo !== undefined && numValor < rangoValido.minimo) {
      return { 
        valido: false, 
        mensaje: `El valor mínimo es ${rangoValido.minimo}` 
      }
    }
    
    if (rangoValido?.maximo !== undefined && numValor > rangoValido.maximo) {
      return { 
        valido: false, 
        mensaje: `El valor máximo es ${rangoValido.maximo}` 
      }
    }
  }
  return { valido: true }
}
