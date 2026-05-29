import type { Meta, StoryObj } from '@storybook/react'
import GenerateReportButton from './GenerateReportButton'

const meta: Meta<typeof GenerateReportButton> = {
  title: 'Features/Reportes/GenerateReportButton',
  component: GenerateReportButton,
  parameters: { layout: 'centered' },
  argTypes: {
    onClick:  { action: 'clicked' },
    loading:  { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof GenerateReportButton>

export const Default: Story = {}

export const Loading: Story = {
  args: { loading: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}