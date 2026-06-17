export type Papel = 'representante' | 'gerente' | 'parceiro'
export type TipoParceiro = 'laboratorio' | 'distribuidora'
export type StatusNegociacao =
  | 'prospeccao' | 'negociacao' | 'acordo_fechado'
  | 'acompanhamento' | 'sem_acordo'
export type TipoNotificacao = 'prazo_proximo' | 'prazo_vencido'

export interface Perfil {
  id: string
  nome: string
  email: string
  telefone: string | null
  papel: Papel
  parceiro_id: string | null
  criado_em: string
}

export interface Parceiro {
  id: string
  nome: string
  tipo: TipoParceiro
  cnpj: string | null
  email: string | null
  telefone: string | null
  representante_id: string | null
  ativo: boolean
  criado_em: string
}

export interface MetaMensal {
  id: string
  parceiro_id: string
  ano: number
  mes: number
  meta_valor: number
  realizado_valor: number
  atualizado_em: string
}

export interface MetaTrimestral {
  id: string
  parceiro_id: string
  ano: number
  trimestre: number
  meta_valor: number
  atualizado_em: string
}

export interface MetaTrimestralView extends MetaTrimestral {
  realizado_valor: number
}

export interface Negociacao {
  id: string
  parceiro_id: string
  titulo: string
  descricao: string | null
  status: StatusNegociacao
  valor_estimado: number | null
  ordem: number
  criado_em: string
  atualizado_em: string
}

export interface Reuniao {
  id: string
  parceiro_id: string
  negociacao_id: string | null
  titulo: string
  data_reuniao: string
  local_link: string | null
  resumo: string | null
  criado_por: string | null
  criado_em: string
}

export interface Tarefa {
  id: string
  parceiro_id: string
  reuniao_id: string | null
  negociacao_id: string | null
  titulo: string
  descricao: string | null
  responsavel_id: string | null
  prazo: string | null
  concluida: boolean
  concluida_em: string | null
  criado_em: string
}

export interface Arquivo {
  id: string
  parceiro_id: string
  reuniao_id: string | null
  nome_arquivo: string
  caminho_storage: string
  tipo: string | null
  tamanho_bytes: number | null
  enviado_por: string | null
  criado_em: string
}

export interface Feriado {
  data: string
  descricao: string
}

export interface Notificacao {
  id: string
  tarefa_id: string | null
  destinatario_id: string | null
  tipo: TipoNotificacao
  enviada_em: string
}
