'use client'
import type { Negociacao } from '@/lib/supabase/types'

interface NegociacaoCardProps {
  negociacao: Negociacao
  nomeParceiro: string
  draggableProps?: React.HTMLAttributes<HTMLDivElement>
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | null
  innerRef?: React.Ref<HTMLDivElement>
}

export default function NegociacaoCard({
  negociacao,
  nomeParceiro,
  draggableProps,
  dragHandleProps,
  innerRef,
}: NegociacaoCardProps) {
  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...(dragHandleProps ?? {})}
      className="bg-white rounded-md border border-gray-200 p-2.5 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
    >
      <p className="text-[9px] font-bold text-red-600 uppercase tracking-wide mb-1">
        {nomeParceiro}
      </p>
      <p className="text-[11px] font-semibold text-gray-900 leading-snug">
        {negociacao.titulo}
      </p>
      {negociacao.valor_estimado != null && (
        <p className="text-[10px] text-gray-400 mt-1">
          {negociacao.valor_estimado.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0,
          })}
        </p>
      )}
    </div>
  )
}
