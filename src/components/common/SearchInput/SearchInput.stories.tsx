import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import SearchInput from './SearchInput'

const meta = {
  title: 'Common/SearchInput',
  component: SearchInput,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: { onChange: fn() },
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Vacio: Story = {
  name: 'Vacío (default)',
  args: { value: '' },
}

export const ConTexto: Story = {
  name: 'Con texto (muestra botón ×)',
  args: { value: 'diabetes' },
}

export const Disabled: Story = {
  name: 'Deshabilitado',
  args: { value: '', disabled: true },
}

export const SizeSm: Story = {
  name: 'Size: sm',
  args: { value: '', size: 'sm', placeholder: 'Buscar usuario…' },
}

export const SizeLg: Story = {
  name: 'Size: lg',
  args: { value: '', size: 'lg', placeholder: 'Buscar reporte…' },
}
