import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import FAB from './FAB'

const meta = {
  title: 'Features/Dashboard/FAB',
  component: FAB,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { onGenerate: fn() },
} satisfies Meta<typeof FAB>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'FAB Generar elemento',
  decorators: [
    Story => (
      <div className="min-h-screen bg-[var(--color-hi-bg)] p-8 relative">
        <p className="text-sm text-[var(--color-hi-text-sub)]">
          Haz click en el botón + (inferior derecho) para generar un elemento.
        </p>
        <Story />
      </div>
    ),
  ],
}
