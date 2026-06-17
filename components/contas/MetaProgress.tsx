import type { RitmoBadge } from '@/lib/metas'

const BAR_COLOR: Record<RitmoBadge, string> = {
  meta_batida: '#111827',
  no_ritmo:    '#22c55e',
  atencao:     '#f59e0b',
  atrasado:    '#DC2626',
}

interface MetaProgressProps {
  label: string
  meta: number
  realizado: number
  ritmo: RitmoBadge
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export default function MetaProgress({ label, meta, realizado, ritmo }: MetaProgressProps) {
  const pct = meta > 0 ? Math.min((realizado / meta) * 100, 100) : 0
  return (
    <div className="flex flex-col items-end min-w-[110px]">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</span>
      <span className="text-[13px] font-bold text-gray-900">{brl(meta)}</span>
      <span className="text-[10px] text-gray-500">{brl(realizado)}</span>
      <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: BAR_COLOR[ritmo] }}
        />
      </div>
    </div>
  )
}
