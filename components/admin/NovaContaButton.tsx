'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NovaContaModal from './NovaContaModal'

interface Representante { id: string; nome: string }
interface Props { representantes: Representante[] }

export default function NovaContaButton({ representantes }: Props) {
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
        + Nova Conta
      </button>
      {aberto && (
        <NovaContaModal
          representantes={representantes}
          onClose={() => setAberto(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
