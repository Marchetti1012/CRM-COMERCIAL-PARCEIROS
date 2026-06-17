// components/painel/TabelaDesempenho.tsx
import type { RitmoBadge } from '@/lib/metas'
import RitmoBadgeComp from '@/components/contas/RitmoBadge'

interface Linha {
  nome: string
  contas: number
  realizado: number
  meta: number
  ritmo: RitmoBadge
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export default function TabelaDesempenho({ linhas }: { linhas: Linha[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Representante</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Contas</th>
            <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Realizado Mês</th>
            <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">% Meta</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Ritmo</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 font-semibold text-gray-900">{l.nome}</td>
              <td className="px-4 py-3 text-center text-gray-600">{l.contas}</td>
              <td className="px-4 py-3 text-right text-gray-900">{brl(l.realizado)}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                {l.meta > 0 ? `${((l.realizado / l.meta) * 100).toFixed(0)}%` : '—'}
              </td>
              <td className="px-4 py-3 flex justify-center">
                <RitmoBadgeComp ritmo={l.ritmo} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
