export const dynamic = 'force-dynamic'

import { getPerfil } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import ProgressiveBlur from '@/components/animations/ProgressiveBlur'

export default async function ParceiroLayout({ children }: { children: React.ReactNode }) {
  const perfil = await getPerfil()
  if (perfil.papel !== 'parceiro') redirect('/contas')

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <Image src="/logo-rede-inova.png" alt="Rede Inova" width={140} height={44} className="object-contain object-left" />
        <span className="text-xs text-gray-500">{perfil.nome}</span>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        {children}
      </main>
      <ProgressiveBlur />
    </div>
  )
}
