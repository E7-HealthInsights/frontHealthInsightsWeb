import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import DeleteActionButton from './DeleteActionButton'
import EditActionButton from '../EditActionButton/EditActionButton'


// ════════════════════════════════════════════════════════════
// DeleteButton — archivo separado sería lo ideal en proyectos
// grandes, pero aquí los agrupamos por proximidad semántica
// ════════════════════════════════════════════════════════════
 
const meta: Meta<typeof DeleteActionButton> = {
    title:     'Features/Usuarios/DeleteButton',
    component: DeleteActionButton,
    tags:      ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: `
  **DeleteButton** — botón ícono de bote de basura basado en \`Button variant="icon"\`.
   
  Al hacer hover el ícono se pinta del rojo danger (\`--color-hi-danger\`)
  y el fondo toma \`bg-red-50\`.
   
  Usar siempre acompañado de una confirmación antes de ejecutar la acción destructiva.
          `,
        },
      },
    },
    args: { onClick: fn() },
  }

  export default meta
   
  type DeleteStory = StoryObj<typeof DeleteActionButton>
   
  export const DeleteDefault: DeleteStory = {
    name: 'Default',
    args: {},
  }
   
  export const DeleteDisabled: DeleteStory = {
    name: 'Disabled',
    args: { disabled: true },
  }
   
  export const JuntosEnTabla: DeleteStory = {
    name: 'Edit + Delete juntos (uso real en tabla)',
    render: () => (
      <div className="flex items-center gap-2 p-3
        border border-[var(--color-hi-border)] rounded-[var(--radius-md)]">
        <span className="text-sm text-[var(--color-hi-text-main)] flex-1">
          Alejandra Mosri
        </span>
        <EditActionButton   onClick={fn()} />
        <DeleteActionButton onClick={fn()} />
      </div>
    ),
  }