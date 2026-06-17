// app/(app)/painel/page.tsx
import { requirePapel } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getRitmoBadge, pctDiasUteisDecorridos } from '@/lib/metas'
import KpiCard from '@/components/painel/KpiCard'
import TabelaDesempenho from '@/components/painel/TabelaDesempenho'
import ScrollReveal from '@/components/animations/ScrollReveal'

export default async function PainelPage() {
  await requirePapel(['gerente'])
  const supabase = await createClient()

  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth() + 1

  const [{ data: feriados }, { data: mensais }, { data: reps }, { data: tarefasVencidas }] = await Promise.all([
    supabase.from('crm_feriados').select('data'),
    supabase.from('crm_metas_mensais').select('parceiro_id, meta_valor, realizado_valor, parceiro:crm_parceiros(representante_id, representante:crm_perfis(nome))').eq('ano', ano).eq('mes', mes),
    supabase.from('crm_perfis').select('id, nome').eq('papel', 'representante'),
    supabase.from('crm_tarefas').select('id').eq('concluida', false).lt('prazo', hoje.toISOString().split('T')[0]),
  ])

  const pctDias = pctDiasUteisDecorridos((feriados ?? []).map(f => f.data))

  const totalMeta = (mensais ?? []).reduce((s, m) => s + (m.meta_valor ?? 0), 0)
  const totalRealizado = (mensais ?? []).reduce((s, m) => s + (m.realizado_valor ?? 0), 0)
  const pctGeral = totalMeta > 0 ? ((totalRealizado / totalMeta) * 100).toFixed(0) + '%' : '—'

  const linhas = (reps ?? []).map(rep => {
    const minhas = (mensais ?? []).filter((m: any) => (m.parceiro as any)?.representante_id === rep.id)
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
            <ScrollReveal key={i} direction="up" duration={700} delay={i * 150}>
              <KpiCard {...kpi} />
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal direction="up" duration={700} delay={400}>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Desempenho por Representante</h2>
          <TabelaDesempenho linhas={linhas} />
        </ScrollReveal>
      </div>
    </div>
  )
}
