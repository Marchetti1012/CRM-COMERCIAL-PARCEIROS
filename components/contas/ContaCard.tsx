import Link from 'next/link'
import RitmoBadge from './RitmoBadge'
import MetaProgress from './MetaProgress'
import type { RitmoBadge as RitmoBadgeType } from '@/lib/metas'

interface ContaCardProps {
  id: string
  nome: string
  tipo: string
  metaMensal: number
  realizadoMensal: number
  metaTrimestral: number
  realizadoTrimestral: number
  ritmo: RitmoBadgeType
}

const BORDER: Record<RitmoBadgeType, string> = {
  meta_batida: '',
  no_ritmo:    '',
  atencao:     'border-l-[3px] border-l-yellow-400 pl-[13px]',
  atrasado:    'border-l-[3px] border-l-red-600 pl-[13px]',
}

export default function ContaCard(props: ContaCardProps) {
  const { id, nome, tipo, metaMensal, realizadoMensal, metaTrimestral, realizadoTrimestral, ritmo } = props
  const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <Link href={`/contas/${id}`}>
      <div className={`bg-white rounded-lg border border-gray-200 px-4 py-3.5 flex items-center gap-4 cursor-pointer hover:shadow-sm transition-shadow ${BORDER[ritmo]}`}>
        <div className="w-8 h-8 bg-[#1f2937] rounded-full flex items-center justify-center text-[11px] font-bold text-gray-400 flex-shrink-0">
          {iniciais}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-gray-900 truncate">{nome}</p>
          <p className="text-[10px] text-gray-400 capitalize">{tipo}</p>
        </div>
        <MetaProgress label="Meta Mensal" meta={metaMensal} realizado={realizadoMensal} ritmo={ritmo} />
        <MetaProgress label="Meta Trim." meta={metaTrimestral} realizado={realizadoTrimestral} ritmo={ritmo} />
        <RitmoBadge ritmo={ritmo} />
      </div>
    </Link>
  )
}
