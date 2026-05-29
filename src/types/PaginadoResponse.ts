export interface PaginadoResponse<T> {
    data:            T[]
    totalElementos:  number
    totalPaginas:    number
    paginaActual:    number
    tamañoPagina:    number
  }  