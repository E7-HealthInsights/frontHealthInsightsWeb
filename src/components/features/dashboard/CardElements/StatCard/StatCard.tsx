import Card from '../../../../common/Card/Card'

interface StatCardProps {
  title:     string
  subtitle?: string
  value:     string | number
  label?:    string
  actions?:  { label: string; onClick: () => void; danger?: boolean }[]
}

export default function StatCard({ title, subtitle, value, label, actions = [] }: StatCardProps) {
  return (
    <Card title={title} subtitle={subtitle} actions={actions}>
      <p className="text-3xl font-bold text-[var(--color-hi-navy)]">
        {value}{typeof value === 'number' && label === '%' ? '%' : ''}
      </p>
      {label && label !== '%' && (
        <p className="text-xs text-[var(--color-hi-text-sub)]">{label}</p>
      )}
    </Card>
  )
}