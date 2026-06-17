'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Papel, Perfil } from '@/lib/supabase/types'

const NAV_ITEMS: Record<Papel, { href: string; label: string }[]> = {
  representante: [
    { href: '/contas', label: 'Minhas Contas' },
    { href: '/kanban', label: 'Kanban' },
  ],
  gerente: [
    { href: '/contas', label: 'Minhas Contas' },
    { href: '/kanban', label: 'Kanban' },
    { href: '/painel', label: 'Painel Geral' },
    { href: '/importar', label: 'Importar Planilha' },
  ],
  parceiro: [
    { href: '/parceiro/painel', label: 'Minha Conta' },
  ],
}

interface SidebarProps { perfil: Perfil }

export default function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const items = NAV_ITEMS[perfil.papel as Papel] ?? []

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const iniciais = perfil.nome
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <aside className="w-[220px] bg-[#111827] flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="bg-white px-4 py-3.5 border-b border-[#1f2937]">
        <Image
          src="/logo-rede-inova.png"
          alt="Rede Inova Drogarias"
          width={180}
          height={52}
          className="object-contain object-left"
        />
      </div>

      <nav className="flex-1 px-2 py-3">
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium mb-0.5 transition-colors ${
                active
                  ? 'bg-[#1f2937] text-gray-100'
                  : 'text-gray-400 hover:bg-[#1f2937] hover:text-gray-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-red-600' : 'bg-[#374151]'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-[#1f2937] flex items-center gap-2">
        <button
          onClick={handleLogout}
          className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
          title="Sair"
        >
          {iniciais}
        </button>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-100 truncate">{perfil.nome}</p>
          <p className="text-[9px] text-gray-500 capitalize">{perfil.papel}</p>
        </div>
      </div>
    </aside>
  )
}
