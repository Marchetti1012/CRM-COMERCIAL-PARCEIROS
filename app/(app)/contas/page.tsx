import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getPerfil } from '@/lib/auth'
import { getRitmoBadge, pctDiasUteisDecorridos } from '@/lib/metas'
import ContaCard from '@/components/contas/ContaCard'
import ScrollReveal from '@/components/animations/ScrollReveal'
import NovaContaButton from '@/components/admin/NovaContaButton'

export default async function ContasPage() {
  const supabase = await createClient()
  const perfil = await getPerfil()

  const { data: feriados } = await supabase.from('crm_feriados').select('data')
  const listaFeriados = (feriados ?? []).map((f: { data: string }) => f.data)
  const pctDias = pctDiasUteisDecorridos(listaFeriados)

  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth() + 1
  const trimestre = Math.ceil(mes / 3)

  const { data: parceiros } = await supabase
    .from('crm_parceiros')
    .select('id, nome, tipo')
    .eq('ativo', true)
    .order('nome')

  const representantes: { id: string; nome: string }[] = []
  if (perfil.papel === 'gerente') {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: reps } = await supabaseAdmin
      .from('crm_perfis')
      .select('id, nome')
      .in('papel', ['representante', 'gerente'])
      .order('nome')
    representantes.push(...(reps ?? []))
  }

  if (!parceiros || parceiros.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-200 px-5 h-[52px] flex items-center justify-between flex-shrink-0">
          <span className="text-[15px] font-bold text-gray-900">Minhas Contas</span>
          {perfil.papel === 'gerente' && <NovaContaButton representantes={representantes} />}
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500">Nenhuma conta encontrada.</p>
        </div>
      </div>
    )
  }

  const ids = parceiros.map((p: { id: string }) => p.id)

  const { data: mensais } = await supabase
    .from('crm_metas_mensais')
    .select('parceiro_id, meta_valor, realizado_valor')
    .in('parceiro_id', ids)
    .eq('ano', ano)
    .eq('mes', mes)

  const { data: trimestrais } = await supabase
    .from('crm_vw_meta_trimestral')
    .select('parceiro_id, meta_valor, realizado_valor')
    .in('parceiro_id', ids)
    .eq('ano', ano)
    .eq('trimestre', trimestre)

  const contas = parceiros.map((p: { id: string; nome: string; tipo: string }) => {
    const m = mensais?.find((x: { parceiro_id: string }) => x.parceiro_id === p.id)
    const t = trimestrais?.find((x: { parceiro_id: string }) => x.parceiro_id === p.id)
    const metaMensal = (m as any)?.meta_valor ?? 0
    const realizadoMensal = (m as any)?.realizado_valor ?? 0
    const metaTrimestral = (t as any)?.meta_valor ?? 0
    const realizadoTrimestral = (t as any)?.realizado_valor ?? 0
    const ritmo = getRitmoBadge({ meta: metaMensal, realizado: realizadoMensal, pctDiasUteis: pctDias })
    return { ...p, metaMensal, realizadoMensal, metaTrimestral, realizadoTrimestral, ritmo }
  })

  const emAtencao = contas.filter((c: any) => c.ritmo === 'atrasado' || c.ritmo === 'atencao')
  const noRitmo = contas.filter((c: any) => c.ritmo === 'no_ritmo' || c.ritmo === 'meta_batida')

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 h-[52px] flex items-center justify-between flex-shrink-0">
        <div>
          <span className="text-[15px] font-bold text-gray-900">Minhas Contas</span>
          <span className="text-xs text-gray-400 ml-2">
            {contas.length} contas · {hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        {perfil.papel === 'gerente' && <NovaContaButton representantes={representantes} />}
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-3">
        {emAtencao.length > 0 && (
          <>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Em Atenção</p>
            {emAtencao.map((c: any, i: number) => (
              <ScrollReveal key={c.id} direction="up" duration={400} distance="16px" delay={i * 80}>
                <ContaCard {...c} />
              </ScrollReveal>
            ))}
          </>
        )}
        {noRitmo.length > 0 && (
          <>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-2">No Ritmo</p>
            {noRitmo.map((c: any, i: number) => (
              <ScrollReveal key={c.id} direction="up" duration={400} distance="16px" delay={i * 80}>
                <ContaCard {...c} />
              </ScrollReveal>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
