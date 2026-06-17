import * as XLSX from 'xlsx'

export interface LinhaRealizado {
  parceiro: string
  tipo: string
  ano: number
  mes: number
  meta_valor: number
  realizado_valor: number
}

export interface LinhaTrimestral {
  parceiro: string
  ano: number
  trimestre: number
  meta_valor: number
}

export interface ParseResult {
  mensal: LinhaRealizado[]
  trimestral: LinhaTrimestral[]
}

export function parseRealizadoXlsx(buffer: Buffer): ParseResult {
  const wb = XLSX.read(buffer, { type: 'buffer' })

  const sheetMensal = wb.Sheets['Realizado Mensal']
  const sheetTrim = wb.Sheets['Metas Trimestrais']

  const rawMensal: any[][] = sheetMensal
    ? XLSX.utils.sheet_to_json(sheetMensal, { header: 1, defval: null })
    : []
  const rawTrim: any[][] = sheetTrim
    ? XLSX.utils.sheet_to_json(sheetTrim, { header: 1, defval: null })
    : []

  const mensal: LinhaRealizado[] = rawMensal.slice(1).flatMap(row => {
    const [parceiro, tipo, ano, mes, meta, realizado] = row
    if (!parceiro) return []
    return [{
      parceiro: String(parceiro),
      tipo: String(tipo ?? 'laboratorio'),
      ano: Number(ano),
      mes: Number(mes),
      meta_valor: Number(meta),
      realizado_valor: Number(realizado),
    }]
  })

  const trimestral: LinhaTrimestral[] = rawTrim.slice(1).flatMap(row => {
    const [parceiro, ano, trimestre, meta] = row
    if (!parceiro) return []
    return [{
      parceiro: String(parceiro),
      ano: Number(ano),
      trimestre: Number(trimestre),
      meta_valor: Number(meta),
    }]
  })

  return { mensal, trimestral }
}
