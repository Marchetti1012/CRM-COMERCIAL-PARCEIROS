'use client'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import NegociacaoCard from './NegociacaoCard'
import type { Negociacao } from '@/lib/supabase/types'

const LABEL: Record<string, string> = {
  prospeccao: 'Prospecção',
  negociacao: 'Negociação',
  acordo_fechado: 'Acordo Fechado',
  acompanhamento: 'Acompanhamento',
  sem_acordo: 'Sem Acordo',
}

interface KanbanColunaProps {
  status: string
  negociacoes: (Negociacao & { parceiro_nome: string })[]
}

export default function KanbanColuna({ status, negociacoes }: KanbanColunaProps) {
  return (
    <div className="flex flex-col w-[200px] flex-shrink-0">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
          {LABEL[status] ?? status}
        </span>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-semibold">
          {negociacoes.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-lg p-2 flex flex-col gap-1.5 min-h-[400px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-red-50' : 'bg-gray-100'
            }`}
          >
            {negociacoes.map((neg, index) => (
              <Draggable key={neg.id} draggableId={neg.id} index={index}>
                {(prov) => (
                  <NegociacaoCard
                    negociacao={neg}
                    nomeParceiro={neg.parceiro_nome}
                    innerRef={prov.innerRef}
                    draggableProps={prov.draggableProps}
                    dragHandleProps={prov.dragHandleProps}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
