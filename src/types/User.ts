type User = {
    id:       number
    nombre:   string
    apellido: string
    correo:   string
    fecha:    string
    tiempo:   string
    rol:    string
    estatus: 'Activo' | 'Inactivo'
  }

  export type { User }