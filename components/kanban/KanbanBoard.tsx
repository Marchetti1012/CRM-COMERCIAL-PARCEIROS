'use client'
import { useState, useRef } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { createClient } from '@/lib/supabase/client'
import KanbanColuna from './KanbanColuna'
import type { Negociacao, StatusNegociacao } from '@/lib/supabase/types'

const COLUNAS: StatusNegociacao[] = [
  'prospeccao',
  'negociacao',
  'acordo_fechado',
  'acompanhamento',
  'sem_acordo',
]

type NegComParceiro = Negociacao & { parceiro_nome: string }

export default function KanbanBoard({ inicial }: { inicial: NegComParceiro[] }) {
  const [items, setItems] = useState<NegComParceiro[]>(inicial)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const id = result.draggableId
    const novoStatus = result.destination.droppableId as StatusNegociacao

    // valida que é um status conhecido
    if (!COLUNAS.includes(novoStatus)) return

    // salva estado anterior para rollback
    const statusAnterior = items.find(n => n.id === id)?.status
    if (!statusAnterior) return

    // optimistic update
    setItems(prev => prev.map(n => n.id === id ? { ...n, status: novoStatus } : n))

    const { error } = await supabase.from('crm_negociacoes').update({ status: novoStatus }).eq('id', id)
    if (error) {
      // rollback
      setItems(prev => prev.map(n => n.id === id ? { ...n, status: statusAnterior } : n))
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 p-5 overflow-x-auto pb-32 h-full">
        {COLUNAS.map((col) => (
          <KanbanColuna
            key={col}
            status={col}
            negociacoes={items.filter((n) => n.status === col)}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
