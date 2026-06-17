'use client'
import { useState } from 'react'
import type { Reuniao } from '@/lib/supabase/types'

export default function ReunioesList({ reunioes }: { reunioes: Reuniao[] }) {
  const [expandido, setExpandido] = useState<string | null>(null)

  if (reunioes.length === 0)
    return <p className="text-sm text-gray-400 p-5">Nenhuma reunião registrada.</p>

  return (
    <div className="p-5 flex flex-col gap-3">
      {reunioes.map(r => (
        <div key={r.id} className="border border-gray-200 rounded-lg bg-white">
          <button
            onClick={() => setExpandido(expandido === r.id ? null : r.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{r.titulo}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(r.data_reuniao).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
                {r.local_link && ` · ${r.local_link}`}
              </p>
            </div>
            <span className="text-gray-400 text-xs">{expandido === r.id ? '▲' : '▼'}</span>
          </button>
          {expandido === r.id && r.resumo && (
            <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
              {r.resumo}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
