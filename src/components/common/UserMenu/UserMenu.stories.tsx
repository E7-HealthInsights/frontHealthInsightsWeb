import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import UserMenu from './UserMenu'

const meta = {
  title: 'Common/UserMenu',
  component: UserMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { onLogout: fn() },
} satisfies Meta<typeof UserMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
