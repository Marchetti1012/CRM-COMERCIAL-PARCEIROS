import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('[criar-usuario] url present:', !!supabaseUrl, '| key present:', !!serviceRoleKey, '| key length:', serviceRoleKey?.length)

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[criar-usuario] env vars ausentes')
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    console.log('[criar-usuario] chamando auth.admin.createUser para:', email.trim())

    const { data: novoUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: senha,
      user_metadata: { nome: nome.trim() },
      email_confirm: true,
    })

    console.log('[criar-usuario] resultado createUser — erro:', authError?.message ?? 'nenhum', '| user id:', novoUser?.user?.id ?? 'nulo')

    if (authError) {
      console.error('[criar-usuario] authError completo:', JSON.stringify(authError))
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!novoUser?.user?.id) {
      console.error('[criar-usuario] createUser sem erro mas user é nulo')
      return NextResponse.json({ error: 'Usuário criado mas sem ID retornado' }, { status: 500 })
    }

    const updates: Record<string, unknown> = { papel, nome: nome.trim() }
    if (papel === 'parceiro' && parceiro_id) updates.parceiro_id = parceiro_id

    const { error: updateError } = await supabaseAdmin
      .from('crm_perfis')
      .update(updates)
      .eq('id', novoUser.user.id)

    if (updateError) {
      console.error('[criar-usuario] updateError:', updateError.message)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, userId: novoUser.user.id })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[criar-usuario] exceção não tratada:', msg, err)
    return NextResponse.json({ error: `Erro interno: ${msg}` }, { status: 500 })
  }
}
