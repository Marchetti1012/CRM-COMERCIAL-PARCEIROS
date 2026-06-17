import { describe, it, expect } from 'vitest'
import { parseRealizadoXlsx } from '@/lib/excel'
import * as XLSX from 'xlsx'

function criarXlsxBuffer(mensal: any[][], trimestral: any[][]): Buffer {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['parceiro', 'tipo', 'ano', 'mes', 'meta', 'realizado'],
    ...mensal
  ]), 'Realizado Mensal')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['parceiro', 'ano', 'trimestre', 'meta'],
    ...trimestral
  ]), 'Metas Trimestrais')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

describe('parseRealizadoXlsx', () => {
  it('extrai linhas da aba Realizado Mensal', () => {
    const buf = criarXlsxBuffer(
      [['Farmácia A', 'laboratorio', 2026, 6, 50000, 30000]],
      []
    )
    const result = parseRealizadoXlsx(buf)
    expect(result.mensal).toHaveLength(1)
    expect(result.mensal[0]).toMatchObject({
      parceiro: 'Farmácia A', ano: 2026, mes: 6, meta_valor: 50000, realizado_valor: 30000
    })
  })

  it('extrai linhas da aba Metas Trimestrais', () => {
    const buf = criarXlsxBuffer([], [['Farmácia A', 2026, 2, 150000]])
    const result = parseRealizadoXlsx(buf)
    expect(result.trimestral).toHaveLength(1)
    expect(result.trimestral[0]).toMatchObject({
      parceiro: 'Farmácia A', ano: 2026, trimestre: 2, meta_valor: 150000
    })
  })

  it('ignora linhas sem nome de parceiro', () => {
    const buf = criarXlsxBuffer([[null, 'laboratorio', 2026, 6, 0, 0]], [])
    const result = parseRealizadoXlsx(buf)
    expect(result.mensal).toHaveLength(0)
  })
})
