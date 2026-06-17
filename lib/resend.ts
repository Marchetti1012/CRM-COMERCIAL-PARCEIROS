// lib/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface AlertaParams {
  destinatario: string
  nomeTarefa: string
  nomeParceiro: string
  prazo: string
  tipo: 'prazo_proximo' | 'prazo_vencido'
}

export async function enviarAlertaPrazo(params: AlertaParams) {
  const { destinatario, nomeTarefa, nomeParceiro, prazo, tipo } = params
  const assunto = tipo === 'prazo_vencido'
    ? `⚠️ Tarefa vencida: ${nomeTarefa}`
    : `🔔 Prazo se aproximando: ${nomeTarefa}`

  await resend.emails.send({
    from: process.env.EMAIL_REMETENTE!,
    to: destinatario,
    subject: assunto,
    html: `
      <p>Olá,</p>
      <p>A tarefa <strong>${nomeTarefa}</strong> da conta <strong>${nomeParceiro}</strong>
      ${tipo === 'prazo_vencido' ? 'está <strong>vencida</strong>' : 'vence em breve'}.
      Prazo: <strong>${new Date(prazo).toLocaleDateString('pt-BR')}</strong>.</p>
      <p>Acesse o <a href="${process.env.NEXT_PUBLIC_APP_URL}/contas">CRM Comercial</a> para atualizar.</p>
      <p>Rede Inova Drogarias</p>
    `,
  })
}
