import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import LoginCard from './LoginCard'

const meta = {
  title: 'Features/Auth/LoginCard',
  component: LoginCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    onSubmit: fn(),
  },
} satisfies Meta<typeof LoginCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const WithError: Story = {
  name: 'Con error de credenciales',
  args: {
    error: 'Correo o contraseña incorrectos',
  },
}
