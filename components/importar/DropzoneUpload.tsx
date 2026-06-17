'use client'
import { useRef, useState } from 'react'

interface DropzoneUploadProps {
  onFile: (file: File) => void
  enviando: boolean
}

export default function DropzoneUpload({ onFile, enviando }: DropzoneUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !enviando && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl px-12 py-16 text-center cursor-pointer transition-colors ${
        dragOver ? 'border-red-600 bg-red-50' : 'border-gray-300 hover:border-red-400'
      } ${enviando ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
        className="hidden"
      />
      <div className="text-4xl mb-3">📊</div>
      <p className="text-sm font-semibold text-gray-700">
        {enviando ? 'Processando...' : 'Arraste o arquivo .xlsx aqui'}
      </p>
      <p className="text-xs text-gray-400 mt-1">ou clique para selecionar</p>
      <p className="text-[10px] text-gray-300 mt-3">modelo_realizado_metas.xlsx</p>
    </div>
  )
}
