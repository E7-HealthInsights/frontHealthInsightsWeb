import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import InputField from './InputField'

const meta = {
  title: 'Common/InputField',
  component: InputField,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'password', 'email', 'number'] },
  },
  args: { onChange: fn() },
} satisfies Meta<typeof InputField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Nombre',
    placeholder: 'Ingresa tu nombre',
    value: '',
  },
}

export const WithValue: Story = {
  args: {
    label: 'Nombre completo',
    placeholder: 'Ingresa tu nombre',
    value: 'Juan Pérez',
  },
}

export const Email: Story = {
  args: {
    label: 'Correo electrónico',
    type: 'email',
    placeholder: 'correo@ejemplo.com',
    value: '',
  },
}

export const Password: Story = {
  args: {
    label: 'Contraseña',
    type: 'password',
    placeholder: 'Ingresa tu contraseña',
    value: 'secreto123',
  },
}

export const Number: Story = {
  args: {
    label: 'Edad',
    type: 'number',
    placeholder: '0',
    value: '25',
  },
}

export const WithError: Story = {
  args: {
    label: 'Correo electrónico',
    type: 'email',
    placeholder: 'correo@ejemplo.com',
    value: 'invalido',
    error: 'Ingresa un correo electrónico válido',
  },
}

export const PasswordWithError: Story = {
  name: 'Password with error',
  args: {
    label: 'Contraseña',
    type: 'password',
    placeholder: 'Ingresa tu contraseña',
    value: '123',
    error: 'La contraseña debe tener al menos 8 caracteres',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Campo deshabilitado',
    placeholder: 'No puedes editar esto',
    value: '',
    disabled: true,
  },
}
