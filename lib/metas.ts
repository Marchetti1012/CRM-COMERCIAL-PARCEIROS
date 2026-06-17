export type RitmoBadge = 'meta_batida' | 'no_ritmo' | 'atencao' | 'atrasado'

interface RitmoInput {
  meta: number
  realizado: number
  pctDiasUteis: number
}

export function calcRitmo({ meta, realizado }: RitmoInput): number {
  if (meta === 0) return 0
  return realizado / meta
}

export function getRitmoBadge({ meta, realizado, pctDiasUteis }: RitmoInput): RitmoBadge {
  if (realizado >= meta) return 'meta_batida'
  const esperado = meta * pctDiasUteis
  if (esperado === 0) return 'no_ritmo'
  const deficit = (esperado - realizado) / esperado
  if (deficit <= 0) return 'no_ritmo'
  if (deficit <= 0.1) return 'atencao'
  return 'atrasado'
}

export function pctDiasUteisDecorridos(feriados: string[]): number {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()

  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0)

  const feriadosSet = new Set(feriados)

  let totalUteis = 0
  let decorridos = 0

  for (let d = new Date(primeiroDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue
    const iso = d.toISOString().split('T')[0]
    if (feriadosSet.has(iso)) continue
    totalUteis++
    if (d <= hoje) decorridos++
  }

  return totalUteis === 0 ? 0 : decorridos / totalUteis
}
