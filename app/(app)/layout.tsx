import { getPerfil } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const perfil = await getPerfil()
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar perfil={perfil} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
