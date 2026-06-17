'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Arquivo } from '@/lib/supabase/types'

function iconeArquivo(tipo: string | null) {
  if (!tipo) return '📄'
  if (tipo.includes('pdf')) return '📕'
  if (tipo.includes('sheet') || tipo.includes('excel')) return '📊'
  if (tipo.includes('image')) return '🖼️'
  return '📄'
}

function tamanho(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

interface ArquivosListProps {
  arquivos: Arquivo[]
  parceiroId: string
  podeUpload: boolean
}

export default function ArquivosList({ arquivos: inicial, parceiroId, podeUpload }: ArquivosListProps) {
  const [arquivos, setArquivos] = useState(inicial)
  const [enviando, setEnviando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEnviando(true)
    const caminho = `${parceiroId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('crm-arquivos').upload(caminho, file)
    if (!error) {
      const { data: inserted } = await supabase
        .from('crm_arquivos')
        .insert({
          parceiro_id: parceiroId,
          nome_arquivo: file.name,
          caminho_storage: caminho,
          tipo: file.type,
          tamanho_bytes: file.size
        })
        .select()
        .single()
      if (inserted) setArquivos(a => [inserted as Arquivo, ...a])
    }
    setEnviando(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDownload(arquivo: Arquivo) {
    const { data } = await supabase.storage
      .from('crm-arquivos')
      .createSignedUrl(arquivo.caminho_storage, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="p-5">
      {podeUpload && (
        <div className="mb-4">
          <input ref={inputRef} type="file" onChange={handleUpload} className="hidden" id="file-upload" />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              enviando ? 'bg-gray-100 text-gray-400' : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {enviando ? 'Enviando...' : '+ Anexar arquivo'}
          </label>
        </div>
      )}
      {arquivos.length === 0
        ? <p className="text-sm text-gray-400">Nenhum arquivo anexado.</p>
        : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {arquivos.map(a => (
              <button
                key={a.id}
                onClick={() => handleDownload(a)}
                className="flex flex-col items-center gap-1 p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-center"
              >
                <span className="text-2xl">{iconeArquivo(a.tipo)}</span>
                <span className="text-[11px] font-medium text-gray-700 line-clamp-2">{a.nome_arquivo}</span>
                <span className="text-[9px] text-gray-400">{tamanho(a.tamanho_bytes)}</span>
              </button>
            ))}
          </div>
        )
      }
    </div>
  )
}
