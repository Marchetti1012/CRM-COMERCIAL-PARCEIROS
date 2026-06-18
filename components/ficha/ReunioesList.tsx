'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Reuniao } from '@/lib/supabase/types'
import NovaReuniaoModal from './NovaReuniaoModal'

interface Props {
  reunioes: Reuniao[]
  parceiroId: string
  podeRegistrar: boolean
}

export default function ReunioesList({ reunioes, parceiroId, podeRegistrar }: Props) {
  const [expandido, setExpandido] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const router = useRouter()

  return (
    <div className="p-5 flex flex-col gap-3">
      {podeRegistrar && (
        <div className="flex justify-end">
          <button
            onClick={() => setModalAberto(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            + Nova Tratativa
          </button>
        </div>
      )}

      {reunioes.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">Nenhuma tratativa registrada ainda.</p>
      ) : (
        reunioes.map(r => (
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
                    hour: '2-digit', minute: '2-digit',
                  })}
                  {r.local_link && ` · ${r.local_link}`}
                </p>
              </div>
              <span className="text-gray-400 text-xs ml-4 flex-shrink-0">{expandido === r.id ? '▲' : '▼'}</span>
            </button>
            {expandido === r.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                {r.resumo
                  ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.resumo}</p>
                  : <p className="text-sm text-gray-400 italic">Sem resumo registrado.</p>
                }
              </div>
            )}
          </div>
        ))
      )}

      {modalAberto && (
        <NovaReuniaoModal
          parceiroId={parceiroId}
          onClose={() => setModalAberto(false)}
          onSuccess={() => {
            setModalAberto(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
