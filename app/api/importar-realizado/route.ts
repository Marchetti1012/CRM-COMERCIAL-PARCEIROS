import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { parseRealizadoXlsx } from '@/lib/excel'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabaseUser = await createServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: perfil } = await supabaseUser
    .from('crm_perfis')
    .select('papel')
    .eq('id', user.id)
    .single()
  if (perfil?.papel !== 'gerente') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const { mensal, trimestral } = parseRealizadoXlsx(buffer)

  const { data: parceiros } = await supabaseAdmin
    .from('crm_parceiros')
    .select('id, nome')

  const mapaId: Record<string, string> = {}
  for (const p of parceiros ?? []) {
    mapaId[p.nome.toLowerCase().trim()] = p.id
  }

  const erros: string[] = []
  let importados = 0

  for (const linha of mensal) {
    const parceiroId = mapaId[linha.parceiro.toLowerCase().trim()]
    if (!parceiroId) {
      erros.push(`Parceiro não encontrado: ${linha.parceiro}`)
      continue
    }
    const { error } = await supabaseAdmin
      .from('crm_metas_mensais')
      .upsert({
        parceiro_id: parceiroId,
        ano: linha.ano,
        mes: linha.mes,
        meta_valor: linha.meta_valor,
        realizado_valor: linha.realizado_valor,
        atualizado_em: new Date().toISOString(),
      }, { onConflict: 'parceiro_id,ano,mes' })
    if (error) erros.push(`Erro ao salvar ${linha.parceiro}: ${error.message}`)
    else importados++
  }

  for (const linha of trimestral) {
    const parceiroId = mapaId[linha.parceiro.toLowerCase().trim()]
    if (!parceiroId) {
      erros.push(`Parceiro não encontrado (trim.): ${linha.parceiro}`)
      continue
    }
    await supabaseAdmin
      .from('crm_metas_trimestrais')
      .upsert({
        parceiro_id: parceiroId,
        ano: linha.ano,
        trimestre: linha.trimestre,
        meta_valor: linha.meta_valor,
        atualizado_em: new Date().toISOString(),
      }, { onConflict: 'parceiro_id,ano,trimestre' })
  }

  return NextResponse.json({ importados, erros, total: mensal.length + trimestral.length })
}
