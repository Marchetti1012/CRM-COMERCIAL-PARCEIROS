import { createClient } from '@/lib/supabase/server'
import { requirePapel } from '@/lib/auth'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import type { Negociacao } from '@/lib/supabase/types'

export default async function KanbanPage() {
  await requirePapel(['gerente', 'representante'])
  const supabase = await createClient()

  const [{ data: rows }, { data: parceiros }] = await Promise.all([
    supabase.from('crm_negociacoes').select('*').order('ordem'),
    supabase.from('crm_parceiros').select('id, nome').eq('ativo', true),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: (Negociacao & { parceiro_nome: string })[] = (rows ?? []).map((n: any) => ({
    id: n.id,
    parceiro_id: n.parceiro_id,
    titulo: n.titulo,
    descricao: n.descricao,
    status: n.status,
    valor_estimado: n.valor_estimado,
    ordem: n.ordem,
    criado_em: n.criado_em,
    atualizado_em: n.atualizado_em,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parceiro_nome: (parceiros ?? []).find((p: any) => p.id === n.parceiro_id)?.nome ?? '',
  }))

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 h-[52px] flex items-center gap-2">
        <span className="text-[15px] font-bold text-gray-900">Kanban</span>
        <span className="text-xs text-gray-400">{items.length} negociações</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard inicial={items} />
      </div>
    </div>
  )
}
