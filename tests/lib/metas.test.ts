import { describe, it, expect } from 'vitest'
import { calcRitmo, getRitmoBadge } from '@/lib/metas'

describe('calcRitmo', () => {
  it('retorna 0 quando não há meta', () => {
    expect(calcRitmo({ meta: 0, realizado: 0, pctDiasUteis: 0.5 })).toBe(0)
  })

  it('retorna 1 quando realizado = meta', () => {
    expect(calcRitmo({ meta: 100, realizado: 100, pctDiasUteis: 0.6 })).toBe(1)
  })

  it('retorna a razão realizado/meta', () => {
    expect(calcRitmo({ meta: 100, realizado: 60, pctDiasUteis: 0.6 })).toBeCloseTo(0.6)
  })
})

describe('getRitmoBadge', () => {
  it('retorna meta_batida quando realizado >= meta', () => {
    expect(getRitmoBadge({ meta: 100, realizado: 105, pctDiasUteis: 0.5 })).toBe('meta_batida')
  })

  it('retorna no_ritmo quando realizado >= esperado', () => {
    expect(getRitmoBadge({ meta: 100, realizado: 55, pctDiasUteis: 0.5 })).toBe('no_ritmo')
  })

  it('retorna atencao quando realizado está até 10% abaixo do esperado', () => {
    expect(getRitmoBadge({ meta: 100, realizado: 46, pctDiasUteis: 0.5 })).toBe('atencao')
  })

  it('retorna atrasado quando realizado está mais de 10% abaixo do esperado', () => {
    expect(getRitmoBadge({ meta: 100, realizado: 40, pctDiasUteis: 0.5 })).toBe('atrasado')
  })
})
