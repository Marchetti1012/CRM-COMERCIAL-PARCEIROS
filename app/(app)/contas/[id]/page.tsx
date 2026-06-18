import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfil } from '@/lib/auth'
import { getRitmoBadge, pctDiasUteisDecorridos } from '@/lib/metas'
import FichaHeader from '@/components/ficha/FichaHeader'
import ReunioesList from '@/components/ficha/ReunioesList'
import TarefasList from '@/components/ficha/TarefasList'
import ArquivosList from '@/components/ficha/ArquivosList'
import Tabs from '@/components/ui/Tabs'

const TABS = [
  { id: 'reunioes', label: 'Reuniões' },
  { id: 'tarefas', label: 'Tarefas' },
  { id: 'arquivos', label: 'Arquivos' },
]

export default async function FichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const perfil = await getPerfil()

  const { data: parceiro } = await supabase
    .from('crm_parceiros')
    .select('*')
    .eq('id', id)
    .single()

  if (!parceiro) notFound()

  let representanteNome = ''
  if (parceiro.representante_id) {
    const { data: rep } = await supabase
      .from('crm_perfis')
      .select('nome')
      .eq('id', parceiro.representante_id)
      .single()
    representanteNome = rep?.nome ?? ''
  }

  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth() + 1
  const trimestre = Math.ceil(mes / 3)

  const [
    { data: feriados },
    { data: mensal },
    { data: trimestralData },
    { data: reunioes },
    { data: tarefas },
    { data: arquivos },
  ] = await Promise.all([
    supabase.from('crm_feriados').select('data'),
    supabase.from('crm_metas_mensais').select('meta_valor,realizado_valor').eq('parceiro_id', id).eq('ano', ano).eq('mes', mes).single(),
    supabase.from('crm_vw_meta_trimestral').select('meta_valor,realizado_valor').eq('parceiro_id', id).eq('ano', ano).eq('trimestre', trimestre).single(),
    supabase.from('crm_reunioes').select('*').eq('parceiro_id', id).order('data_reuniao', { ascending: false }),
    supabase.from('crm_tarefas').select('*').eq('parceiro_id', id).eq('concluida', false).order('prazo'),
    supabase.from('crm_arquivos').select('*').eq('parceiro_id', id).order('criado_em', { ascending: false }),
  ])

  const pctDias = pctDiasUteisDecorridos((feriados ?? []).map((f: { data: string }) => f.data))
  const metaMensal = (mensal as any)?.meta_valor ?? 0
  const realizadoMensal = (mensal as any)?.realizado_valor ?? 0
  const ritmo = getRitmoBadge({ meta: metaMensal, realizado: realizadoMensal, pctDiasUteis: pctDias })
  const podeUpload = perfil.papel === 'gerente' || perfil.papel === 'representante'

  return (
    <div className="flex flex-col h-full">
      <FichaHeader
        nome={parceiro.nome}
        tipo={parceiro.tipo}
        representante={representanteNome}
        metaMensal={metaMensal}
        realizadoMensal={realizadoMensal}
        metaTrimestral={(trimestralData as any)?.meta_valor ?? 0}
        realizadoTrimestral={(trimestralData as any)?.realizado_valor ?? 0}
        ritmo={ritmo}
      />
      <Tabs tabs={TABS} panels={{
        reunioes: <ReunioesList reunioes={reunioes ?? []} />,
        tarefas: <TarefasList tarefas={tarefas ?? []} />,
        arquivos: <ArquivosList arquivos={arquivos ?? []} parceiroId={id} podeUpload={podeUpload} />,
      }} />
    </div>
  )
}
