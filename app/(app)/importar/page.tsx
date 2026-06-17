'use client'
import { useState } from 'react'
import DropzoneUpload from '@/components/importar/DropzoneUpload'
import ScrollReveal from '@/components/animations/ScrollReveal'

interface ImportResult {
  importados: number
  erros: string[]
  total: number
}

export default function ImportarPage() {
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<ImportResult | null>(null)

  async function handleFile(file: File) {
    setEnviando(true)
    setResultado(null)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/importar-realizado', { method: 'POST', body: form })
    const data = await res.json()
    setResultado(data)
    setEnviando(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 h-[52px] flex items-center">
        <span className="text-[15px] font-bold text-gray-900">Importar Planilha de Metas</span>
      </div>
      <div className="flex-1 overflow-y-auto p-8 pb-32">
        <ScrollReveal direction="up" duration={700}>
          <div className="max-w-xl mx-auto">
            <DropzoneUpload onFile={handleFile} enviando={enviando} />
            {resultado && (
              <div className="mt-6 p-4 rounded-lg bg-white border border-gray-200">
                <p className="text-sm font-bold text-gray-900 mb-2">
                  ✓ {resultado.importados} registros importados de {resultado.total}
                </p>
                {resultado.erros.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-red-600 mb-1">
                      {resultado.erros.length} erros:
                    </p>
                    <ul className="text-xs text-red-500 list-disc list-inside">
                      {resultado.erros.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
