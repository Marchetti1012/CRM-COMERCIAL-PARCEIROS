'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }
    const { data: perfil } = await supabase
      .from('crm_perfis')
      .select('papel')
      .single()
    if (perfil?.papel === 'parceiro') router.push('/parceiro/painel')
    else if (perfil?.papel === 'gerente') router.push('/painel')
    else router.push('/contas')
  }

  return (
    <div className="min-h-screen flex">
      {/* Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 bg-white">
        <div className="w-full max-w-sm">
          <Image
            src="/logo-rede-inova.png"
            alt="Rede Inova Drogarias"
            width={200}
            height={70}
            className="mb-10"
            priority
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo</h1>
          <p className="text-sm text-gray-500 mb-8">Acesse o CRM Comercial</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <button
              type="submit"
              disabled={carregando}
              className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-md text-sm transition-colors disabled:opacity-60"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>

      {/* Marca */}
      <div className="hidden md:flex w-2/5 bg-red-600 flex-col items-center justify-center px-12">
        <p className="text-white text-3xl font-bold text-center leading-tight">
          Aqui nós cuidamos de você!
        </p>
        <p className="text-red-200 text-sm mt-4 text-center">
          Gestão de contas e metas comerciais
        </p>
      </div>
    </div>
  )
}
