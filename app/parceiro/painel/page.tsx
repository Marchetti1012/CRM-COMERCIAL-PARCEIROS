// app/(parceiro)/painel/page.tsx
import { getPerfil } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getRitmoBadge, pctDiasUteisDecorridos } from '@/lib/metas'
import FichaHeader from '@/components/ficha/FichaHeader'
import ReunioesList from '@/components/ficha/ReunioesList'
import TarefasList from '@/components/ficha/TarefasList'
import ArquivosList from '@/components/ficha/ArquivosList'
import Tabs from '@/components/ui/Tabs'
import ScrollReveal from '@/components/animations/ScrollReveal'

const TABS = [
  { id: 'reunioes', label: 'Reuniões' },
  { id: 'tarefas', label: 'Tarefas Abertas' },
  { id: 'arquivos', label: 'Arquivos' },
]

export default async function PainelParceiroPage() {
  const perfil = await getPerfil()
  const supabase = await createClient()

  if (!perfil.parceiro_id) {
    return <p className="text-sm text-gray-500">Conta não vinculada. Contate o gerente.</p>
  }

  const parceiroId = perfil.parceiro_id
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth() + 1
  const trimestre = Math.ceil(mes / 3)

  const [
    { data: parceiro },
    { data: feriados },
    { data: mensal },
    { data: trimestralData },
    { data: reunioes },
    { data: tarefas },
    { data: arquivos },
  ] = await Promise.all([
    supabase.from('crm_parceiros').select('nome, tipo').eq('id', parceiroId).single(),
    supabase.from('crm_feriados').select('data'),
    supabase.from('crm_metas_mensais').select('meta_valor, realizado_valor').eq('parceiro_id', parceiroId).eq('ano', ano).eq('mes', mes).single(),
    supabase.from('crm_vw_meta_trimestral').select('meta_valor, realizado_valor').eq('parceiro_id', parceiroId).eq('ano', ano).eq('trimestre', trimestre).single(),
    supabase.from('crm_reunioes').select('*').eq('parceiro_id', parceiroId).order('data_reuniao', { ascending: false }).limit(5),
    supabase.from('crm_tarefas').select('*').eq('parceiro_id', parceiroId).eq('concluida', false).order('prazo'),
    supabase.from('crm_arquivos').select('*').eq('parceiro_id', parceiroId).order('criado_em', { ascending: false }),
  ])

  const pctDias = pctDiasUteisDecorridos((feriados ?? []).map((f: { data: string }) => f.data))
  const metaMensal = (mensal as any)?.meta_valor ?? 0
  const realizadoMensal = (mensal as any)?.realizado_valor ?? 0
  const ritmo = getRitmoBadge({ meta: metaMensal, realizado: realizadoMensal, pctDiasUteis: pctDias })

  return (
    <div className="flex flex-col gap-4">
      <ScrollReveal direction="up" duration={700}>
        <FichaHeader
          nome={parceiro?.nome ?? ''}
          tipo={parceiro?.tipo ?? ''}
          representante=""
          metaMensal={metaMensal}
          realizadoMensal={realizadoMensal}
          metaTrimestral={(trimestralData as any)?.meta_valor ?? 0}
          realizadoTrimestral={(trimestralData as any)?.realizado_valor ?? 0}
          ritmo={ritmo}
        />
      </ScrollReveal>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Tabs tabs={TABS}>
          {(activeId) => (
            <>
              {activeId === 'reunioes' && <ReunioesList reunioes={reunioes ?? []} />}
              {activeId === 'tarefas' && <TarefasList tarefas={tarefas ?? []} />}
              {activeId === 'arquivos' && (
                <ArquivosList
                  arquivos={arquivos ?? []}
                  parceiroId={parceiroId}
                  podeUpload={false}
                />
              )}
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}
