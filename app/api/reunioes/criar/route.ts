import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { data: perfil } = await supabase
      .from('crm_perfis')
      .select('papel')
      .eq('id', user.id)
      .single()

    if (!perfil || !['gerente', 'representante'].includes(perfil.papel)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await req.json()
    const { parceiro_id, titulo, data_reuniao, local_link, resumo } = body

    if (!parceiro_id || !titulo?.trim() || !data_reuniao || !resumo?.trim()) {
      return NextResponse.json({ error: 'Parceiro, título, data e resumo são obrigatórios' }, { status: 400 })
    }

    const supabaseAdmin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await supabaseAdmin
      .from('crm_reunioes')
      .insert({
        parceiro_id,
        titulo: titulo.trim(),
        data_reuniao,
        local_link: local_link?.trim() || null,
        resumo: resumo.trim(),
        criado_por: user.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ reuniao: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[criar-reuniao]', msg)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
