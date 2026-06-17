'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tarefa } from '@/lib/supabase/types'

function isPrazoVencido(prazo: string | null) {
  if (!prazo) return false
  return new Date(prazo) < new Date()
}

export default function TarefasList({ tarefas: inicial }: { tarefas: Tarefa[] }) {
  const [tarefas, setTarefas] = useState(inicial)
  const supabase = createClient()

  async function toggleConcluida(id: string, atual: boolean) {
    await supabase
      .from('crm_tarefas')
      .update({ concluida: !atual, concluida_em: !atual ? new Date().toISOString() : null })
      .eq('id', id)
    setTarefas(ts => ts.map(t => t.id === id ? { ...t, concluida: !atual } : t))
  }

  if (tarefas.length === 0)
    return <p className="text-sm text-gray-400 p-5">Nenhuma tarefa cadastrada.</p>

  return (
    <div className="p-5 flex flex-col gap-2">
      {tarefas.map(t => (
        <div key={t.id} className={`flex items-center gap-3 bg-white border rounded-lg px-4 py-3 ${
          !t.concluida && isPrazoVencido(t.prazo) ? 'border-red-300' : 'border-gray-200'
        }`}>
          <input
            type="checkbox"
            checked={t.concluida}
            onChange={() => toggleConcluida(t.id, t.concluida)}
            className="w-4 h-4 accent-red-600 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${t.concluida ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {t.titulo}
            </p>
            {t.prazo && (
              <p className={`text-xs mt-0.5 ${!t.concluida && isPrazoVencido(t.prazo) ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                Prazo: {new Date(t.prazo).toLocaleDateString('pt-BR')}
                {!t.concluida && isPrazoVencido(t.prazo) && ' · Vencido'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
