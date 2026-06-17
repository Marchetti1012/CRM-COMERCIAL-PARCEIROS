'use client'
import { useState } from 'react'

interface Parceiro { id: string; nome: string }

interface Props {
  parceiros: Parceiro[]
  onClose: () => void
  onSuccess: () => void
}

export default function NovoUsuarioModal({ parceiros, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', papel: 'representante', parceiro_id: '',
  })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const res = await fetch('/api/admin/criar-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErro(data.error || `Erro ao criar usuário (${res.status})`)
        return
      }
      onSuccess()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const PAPEIS = [
    { value: 'representante', label: 'Representante' },
    { value: 'parceiro', label: 'Parceiro (acesso externo)' },
    { value: 'gerente', label: 'Gerente' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Novo Usuário</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome *</label>
            <input value={form.nome} onChange={set('nome')} required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail *</label>
            <input type="email" value={form.email} onChange={set('email')} required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Senha * (mín. 8 caracteres)</label>
            <input type="password" value={form.senha} onChange={set('senha')} required minLength={8}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Papel *</label>
            <select value={form.papel} onChange={set('papel')}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              {PAPEIS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          {form.papel === 'parceiro' && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conta do Parceiro</label>
              <select value={form.parceiro_id} onChange={set('parceiro_id')}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">— Selecione —</option>
                {parceiros.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          )}
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md">
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60">
              {salvando ? 'Salvando...' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
