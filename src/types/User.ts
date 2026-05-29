type User = {
    id:       string
    nombre:   string
    apellido: string
    correo:   string
    rol:    string
    estatus: 'Activo' | 'Inactivo'
  }

  export type { User }