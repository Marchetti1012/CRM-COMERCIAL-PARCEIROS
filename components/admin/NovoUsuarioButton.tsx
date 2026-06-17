'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NovoUsuarioModal from './NovoUsuarioModal'

interface Parceiro { id: string; nome: string }
interface Props { parceiros: Parceiro[] }

export default function NovoUsuarioButton({ parceiros }: Props) {
  const [aberto, setAberto] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    setAberto(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        + Novo Usuário
      </button>
      {aberto && (
        <NovoUsuarioModal
          parceiros={parceiros}
          onClose={() => setAberto(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
