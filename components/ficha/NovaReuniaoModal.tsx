'use client'
import { useState } from 'react'

interface Props {
  parceiroId: string
  onClose: () => void
  onSuccess: () => void
}

export default function NovaReuniaoModal({ parceiroId, onClose, onSuccess }: Props) {
  const agora = new Date()
  agora.setMinutes(0, 0, 0)
  const dataDefault = agora.toISOString().slice(0, 16)

  const [form, setForm] = useState({
    titulo: '',
    data_reuniao: dataDefault,
    local_link: '',
    resumo: '',
  })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const res = await fetch('/api/reunioes/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, parceiro_id: parceiroId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErro(data.error || `Erro ${res.status}`)
        return
      }
      onSuccess()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Registrar Reunião / Tratativa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Título *</label>
            <input
              value={form.titulo}
              onChange={set('titulo')}
              required
              placeholder="Ex: Reunião de alinhamento mensal"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data e Hora *</label>
              <input
                type="datetime-local"
                value={form.data_reuniao}
                onChange={set('data_reuniao')}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Local / Link</label>
              <input
                value={form.local_link}
                onChange={set('local_link')}
                placeholder="Ex: Meet, Escritório..."
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resumo / Tratativas *</label>
            <textarea
              value={form.resumo}
              onChange={set('resumo')}
              required
              rows={6}
              placeholder="Descreva os pontos discutidos, decisões tomadas, próximos passos..."
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
            />
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md">
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60">
              {salvando ? 'Salvando...' : 'Registrar Tratativa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
