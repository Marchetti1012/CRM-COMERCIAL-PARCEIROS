// app/api/cron/notificacoes-prazo/route.ts
import { createClient } from '@supabase/supabase-js'
import { enviarAlertaPrazo } from '@/lib/resend'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const hoje = new Date()
  const limite = new Date(hoje)
  limite.setDate(limite.getDate() + 2)
  const hojeFmt = hoje.toISOString().split('T')[0]
  const limiteFmt = limite.toISOString().split('T')[0]

  const { data: tarefas } = await supabase
    .from('crm_tarefas')
    .select(`
      id, titulo, prazo, responsavel_id,
      parceiro:crm_parceiros(nome),
      responsavel:crm_perfis!crm_tarefas_responsavel_id_fkey(email)
    `)
    .eq('concluida', false)
    .lte('prazo', limiteFmt)
    .not('prazo', 'is', null)

  if (!tarefas || tarefas.length === 0) return NextResponse.json({ enviados: 0 })

  const { data: gerente } = await supabase
    .from('crm_perfis')
    .select('email')
    .eq('papel', 'gerente')
    .single()

  let enviados = 0

  for (const tarefa of tarefas) {
    const tipo: 'prazo_proximo' | 'prazo_vencido' = tarefa.prazo < hojeFmt ? 'prazo_vencido' : 'prazo_proximo'

    const destinatarios = new Set<string>()
    if ((tarefa.responsavel as any)?.email) destinatarios.add((tarefa.responsavel as any).email)
    if (gerente?.email) destinatarios.add(gerente.email)

    for (const email of destinatarios) {
      const { data: existing } = await supabase
        .from('crm_notificacoes')
        .select('id')
        .eq('tarefa_id', tarefa.id)
        .eq('tipo', tipo)
        .maybeSingle()

      if (existing) continue

      await enviarAlertaPrazo({
        destinatario: email,
        nomeTarefa: tarefa.titulo,
        nomeParceiro: (tarefa.parceiro as any)?.nome ?? '',
        prazo: tarefa.prazo,
        tipo,
      })

      // sempre registra para deduplicação, independente de ter responsável
      await supabase.from('crm_notificacoes').insert({
        tarefa_id: tarefa.id,
        destinatario_id: tarefa.responsavel_id ?? null,
        tipo,
      })

      enviados++
    }
  }

  return NextResponse.json({ enviados })
}
