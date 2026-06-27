// Este módulo no tiene schemas Zod porque los filtros de búsqueda
// son query params opcionales que se validan manualmente en el controlador.
// Se exportan aquí las constantes de validación para mantenerlas centralizadas.

export const TIPOS_VALIDOS = ['PISO', 'CASA', 'ESTUDIO', 'ATICO', 'DUPLEX'];

export const GENEROS_VALIDOS = ['HOMBRE', 'MUJER'];

export const ORDENES_VALIDOS = ['precio_asc', 'precio_desc'];
