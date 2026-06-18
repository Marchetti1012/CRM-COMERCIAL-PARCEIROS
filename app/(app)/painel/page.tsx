import { requirePapel } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { getRitmoBadge, pctDiasUteisDecorridos } from '@/lib/metas'
import KpiCard from '@/components/painel/KpiCard'
import TabelaDesempenho from '@/components/painel/TabelaDesempenho'

export default async function PainelPage() {
  await requirePapel(['gerente'])

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth() + 1

  const [{ data: feriados }, { data: mensais }, { data: parceiros }, { data: reps }, { data: tarefasVencidas }] = await Promise.all([
    supabase.from('crm_feriados').select('data'),
    supabase.from('crm_metas_mensais').select('parceiro_id, meta_valor, realizado_valor').eq('ano', ano).eq('mes', mes),
    supabase.from('crm_parceiros').select('id, representante_id').eq('ativo', true),
    supabase.from('crm_perfis').select('id, nome').eq('papel', 'representante'),
    supabase.from('crm_tarefas').select('id').eq('concluida', false).lt('prazo', hoje.toISOString().split('T')[0]),
  ])

  const pctDias = pctDiasUteisDecorridos((feriados ?? []).map(f => f.data))

  const totalMeta = (mensais ?? []).reduce((s, m) => s + (m.meta_valor ?? 0), 0)
  const totalRealizado = (mensais ?? []).reduce((s, m) => s + (m.realizado_valor ?? 0), 0)
  const pctGeral = totalMeta > 0 ? ((totalRealizado / totalMeta) * 100).toFixed(0) + '%' : '—'

  const linhas = (reps ?? []).map(rep => {
    const minhas = (mensais ?? []).filter((m: any) => {
      const parc = (parceiros ?? []).find((p: any) => p.id === m.parceiro_id)
      return parc?.representante_id === rep.id
    })
    const realizado = minhas.reduce((s, m) => s + (m.realizado_valor ?? 0), 0)
    const meta = minhas.reduce((s, m) => s + (m.meta_valor ?? 0), 0)
    const ritmo = getRitmoBadge({ meta, realizado, pctDiasUteis: pctDias })
    return { nome: rep.nome, contas: minhas.length, realizado, meta, ritmo }
  })

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 h-[52px] flex items-center">
        <span className="text-[15px] font-bold text-gray-900">Painel do Gerente</span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total de Contas', valor: String((mensais ?? []).length), sub: 'ativas este mês' },
            { label: '% Meta Mês', valor: pctGeral, cor: 'text-red-600' },
            { label: 'Realizado Mês', valor: totalRealizado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) },
            { label: 'Tarefas Vencidas', valor: String((tarefasVencidas ?? []).length), cor: (tarefasVencidas ?? []).length > 0 ? 'text-red-600' : 'text-gray-900' },
          ].map((kpi, i) => (
            <KpiCard key={i} {...kpi} />
          ))}
        </div>
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Desempenho por Representante</h2>
          <TabelaDesempenho linhas={linhas} />
        </div>
      </div>
    </div>
  )
}
