// components/painel/KpiCard.tsx
interface KpiCardProps { label: string; valor: string; sub?: string; cor?: string }

export default function KpiCard({ label, valor, sub, cor = 'text-gray-900' }: KpiCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex flex-col gap-1">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${cor}`}>{valor}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}
