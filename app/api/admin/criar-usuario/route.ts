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

    console.log('[criar-usuario] url present:', !!supabaseUrl, '| key present:', !!serviceRoleKey)

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[criar-usuario] env vars ausentes')
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }

    // Chama a Auth Admin API diretamente para ter visibilidade completa do erro
    const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password: senha,
        user_metadata: { nome: nome.trim() },
        email_confirm: true,
      }),
    })

    const authData = await authRes.json().catch(() => ({}))
    console.log('[criar-usuario] auth status:', authRes.status, '| body:', JSON.stringify(authData))

    if (!authRes.ok) {
      const errMsg = authData?.msg || authData?.message || authData?.error_description || authData?.error || `HTTP ${authRes.status}`
      return NextResponse.json({ error: `Erro ao criar usuário: ${errMsg}` }, { status: 500 })
    }

    const userId: string = authData.id
    if (!userId) {
      return NextResponse.json({ error: 'Auth retornou OK mas sem ID de usuário' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Upsert garante que o perfil exista mesmo se o trigger falhou silenciosamente
    const upsertData: Record<string, unknown> = {
      id: userId,
      email: email.trim(),
      nome: nome.trim(),
      papel,
    }
    if (papel === 'parceiro' && parceiro_id) upsertData.parceiro_id = parceiro_id

    const { error: upsertError } = await supabaseAdmin
      .from('crm_perfis')
      .upsert(upsertData, { onConflict: 'id' })

    if (upsertError) {
      console.error('[criar-usuario] upsertError:', upsertError.message)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, userId })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[criar-usuario] exceção não tratada:', msg)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
