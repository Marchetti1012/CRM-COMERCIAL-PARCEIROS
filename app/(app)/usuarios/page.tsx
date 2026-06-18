import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { requirePapel } from '@/lib/auth'
import NovoUsuarioButton from '@/components/admin/NovoUsuarioButton'

const PAPEL_LABEL: Record<string, string> = {
  gerente: 'Gerente',
  representante: 'Representante',
  parceiro: 'Parceiro',
}

export default async function UsuariosPage() {
  await requirePapel(['gerente'])

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: usuarios }, { data: parceiros }] = await Promise.all([
    supabaseAdmin
      .from('crm_perfis')
      .select('id, nome, email, papel, parceiro_id')
      .order('nome'),
    supabaseAdmin
      .from('crm_parceiros')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome'),
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 h-[52px] flex items-center justify-between flex-shrink-0">
        <div>
          <span className="text-[15px] font-bold text-gray-900">Usuários</span>
          <span className="text-xs text-gray-400 ml-2">{usuarios?.length ?? 0} cadastrados</span>
        </div>
        <NovoUsuarioButton parceiros={parceiros ?? []} />
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {!usuarios || usuarios.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">Nenhum usuário cadastrado ainda.</p>
            <p className="text-xs text-gray-400 mt-1">Clique em &quot;+ Novo Usuário&quot; para adicionar.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Papel</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Conta</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u: any) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.nome}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.papel === 'gerente' ? 'bg-red-100 text-red-700' :
                        u.papel === 'representante' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {PAPEL_LABEL[u.papel] ?? u.papel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {parceiros?.find((p: any) => p.id === u.parceiro_id)?.nome ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
