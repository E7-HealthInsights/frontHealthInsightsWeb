import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import Dropdown from './Dropdown'

const sampleOptions = [
  { value: 'fuente1', label: 'INEGI' },
  { value: 'fuente2', label: 'Secretaría de Salud' },
  { value: 'fuente3', label: 'CONAPO' },
  { value: 'fuente4', label: 'SSA' },
]

const meta = {
  title: 'Common/Dropdown',
  component: Dropdown,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    options: sampleOptions,
    onChange: fn(),
  },
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: '',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Fuente de datos',
    value: '',
  },
}

export const WithSelection: Story = {
  args: {
    label: 'Fuente de datos',
    value: 'fuente2',
  },
}

export const WithError: Story = {
  args: {
    label: 'Fuente de datos',
    value: '',
    error: 'Debes seleccionar una fuente',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Fuente de datos',
    value: 'fuente1',
    disabled: true,
  },
}

export const EmptyOptions: Story = {
  args: {
    label: 'Tipo',
    value: '',
    options: [],
  },
}
