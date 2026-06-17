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
  const { nome, email, senha, papel, parceiro_id } = body

  if (!nome?.trim() || !email?.trim() || !senha || !papel) {
    return NextResponse.json({ error: 'Nome, e-mail, senha e papel são obrigatórios' }, { status: 400 })
  }
  if (!['representante', 'parceiro', 'gerente'].includes(papel)) {
    return NextResponse.json({ error: 'Papel inválido' }, { status: 400 })
  }
  if (senha.length < 8) {
    return NextResponse.json({ error: 'Senha deve ter ao menos 8 caracteres' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: novoUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password: senha,
    user_metadata: { nome: nome.trim() },
    email_confirm: true,
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  const updates: Record<string, unknown> = { papel, nome: nome.trim() }
  if (papel === 'parceiro' && parceiro_id) updates.parceiro_id = parceiro_id

  const { error: updateError } = await supabaseAdmin
    .from('crm_perfis')
    .update(updates)
    .eq('id', novoUser.user.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json({ ok: true, userId: novoUser.user.id })
}
