import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Papel } from '@/lib/supabase/types'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user
}

export async function getPerfil() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('crm_perfis')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil) redirect('/login')
  return perfil
}

export async function requirePapel(papeis: Papel[]) {
  const perfil = await getPerfil()
  if (!papeis.includes(perfil.papel as Papel)) redirect('/contas')
  return perfil
}

export function redirectByPapel(papel: Papel): string {
  if (papel === 'parceiro') return '/parceiro/painel'
  if (papel === 'gerente') return '/painel'
  return '/contas'
}
