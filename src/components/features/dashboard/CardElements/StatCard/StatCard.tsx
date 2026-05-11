
import Card from '../../../../common/Card/Card'

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  label?: string;
}

export default function StatCard({ title, subtitle, value, label }: StatCardProps) {

  return (
    <Card title={title} subtitle={subtitle}
    actions={[
        { label: 'Editar',    onClick: () => console.log('Editar') },
        { label: 'Duplicar',  onClick: () => console.log('Duplicar') },
        { label: 'Eliminar',  onClick: () => console.log('Eliminar'), danger: true },
      ]}
    >
      <p className="text-3xl font-bold text-[var(--color-hi-navy)]">
        {value}{typeof value === 'number' && label === '%' ? '%' : ''}
      </p>
      {label && label !== '%' && (
        <p className="text-xs text-[var(--color-hi-text-sub)]">{label}</p>
      )}
    </Card>
  )
}