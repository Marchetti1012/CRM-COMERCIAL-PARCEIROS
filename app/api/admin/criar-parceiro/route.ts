import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

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

  const body = await req.json()
  const { nome, tipo, cnpj, email, telefone, representante_id } = body
  if (!nome?.trim() || !tipo) {
    return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 })
  }
  if (!['laboratorio', 'distribuidora'].includes(tipo)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabaseAdmin
    .from('crm_parceiros')
    .insert({
      nome: nome.trim(),
      tipo,
      cnpj: cnpj?.trim() || null,
      email: email?.trim() || null,
      telefone: telefone?.trim() || null,
      representante_id: representante_id || null,
      ativo: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ parceiro: data })
}
