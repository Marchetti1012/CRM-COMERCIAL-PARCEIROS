import RitmoBadge from '@/components/contas/RitmoBadge'
import MetaProgress from '@/components/contas/MetaProgress'
import type { RitmoBadge as RitmoBadgeType } from '@/lib/metas'

interface FichaHeaderProps {
  nome: string
  tipo: string
  representante: string
  metaMensal: number
  realizadoMensal: number
  metaTrimestral: number
  realizadoTrimestral: number
  ritmo: RitmoBadgeType
}

export default function FichaHeader(props: FichaHeaderProps) {
  const { nome, tipo, representante, metaMensal, realizadoMensal, metaTrimestral, realizadoTrimestral, ritmo } = props
  return (
    <div className="bg-white border-b border-gray-200 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{nome}</h1>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">{tipo}{representante ? ` · ${representante}` : ''}</p>
        </div>
        <RitmoBadge ritmo={ritmo} />
      </div>
      <div className="flex gap-6 mt-4">
        <MetaProgress label="Meta Mensal" meta={metaMensal} realizado={realizadoMensal} ritmo={ritmo} />
        <MetaProgress label="Meta Trimestral" meta={metaTrimestral} realizado={realizadoTrimestral} ritmo={ritmo} />
      </div>
    </div>
  )
}
