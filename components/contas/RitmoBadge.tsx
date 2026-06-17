import type { RitmoBadge as RitmoBadgeType } from '@/lib/metas'

const CONFIG: Record<RitmoBadgeType, { label: string; className: string }> = {
  meta_batida: { label: '🏆 Meta Batida', className: 'bg-gray-900 text-white' },
  no_ritmo:    { label: '✓ No Ritmo',    className: 'bg-green-100 text-green-800' },
  atencao:     { label: '⚠ Atenção',     className: 'bg-yellow-100 text-yellow-800' },
  atrasado:    { label: '✕ Atrasado',    className: 'bg-red-100 text-red-700' },
}

export default function RitmoBadge({ ritmo }: { ritmo: RitmoBadgeType }) {
  const { label, className } = CONFIG[ritmo]
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${className}`}>
      {label}
    </span>
  )
}
