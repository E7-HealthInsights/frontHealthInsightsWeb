import { useState } from 'react'
import Card from '../../../common/Card'
import InputField from '../../../common/InputField'
import Button from '../../../common/Button'

interface LoginCardProps {
  onSubmit?: (email: string, password: string) => void
  loading?:  boolean
  error?:    string
}

export default function LoginCard({
  onSubmit,
  loading = false,
  error   = '',
}: LoginCardProps) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(email, password)
  }

  return (
    <Card className="w-full max-w-[420px] !p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--color-hi-text-main)]">
          Iniciar sesión
        </h2>
        <p className="mt-1 text-sm text-[var(--color-hi-text-sub)]">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <InputField
          label="Correo electrónico"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={setEmail}
          disabled={loading}
        />

        <InputField
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          error={error}
          disabled={loading}
        />

        <p className="text-xs text-[var(--color-hi-text-hint)] -mt-1">
          Si olvidaste tu contraseña contáctate con el administrador
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full mt-2"
        >
          Ingresar
        </Button>
      </form>
    </Card>
  )
}
