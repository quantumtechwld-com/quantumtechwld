import { emailLogoHeader, emailFooterTeam } from "./shared";
import type { InviteLocale } from "./invite";

/**
 * Template de e-mail de confirmação de lead (resposta automática em até 2h).
 * Enviado ao potencial cliente imediatamente após submissão do formulário.
 */
export function tplLeadConfirmation(name: string, locale: InviteLocale = "pt") {
  const copy = {
    pt: {
      subject: "✅ Recebemos sua solicitação — Diagnóstico em até 24h",
      greeting: `Olá ${name},`,
      intro: "Obrigado por entrar em contato com a Quantum Technology Agency!",
      received: "Recebemos sua solicitação de diagnóstico e nosso time já está analisando seu projeto.",
      nextSteps: "<strong>Próximos passos:</strong>",
      step1: "<strong>1. Análise inicial</strong> — Vamos revisar todos os detalhes que você compartilhou conosco.",
      step2: "<strong>2. Diagnóstico completo</strong> — Em até <strong>24 horas</strong>, você receberá um relatório de complexidade com estimativa de horas e investimento.",
      step3: "<strong>3. Agendamento de call</strong> — Se quiser, podemos agendar uma conversa de 30–60 minutos para alinhar detalhes e responder perguntas.",
      contact: "Se tiver qualquer dúvida antes disso, pode responder este e-mail ou nos chamar no WhatsApp.",
      closing: "Estamos empolgados para ajudar você a tirar esse projeto do papel!",
    },
    en: {
      subject: "✅ We received your request — Diagnosis within 24h",
      greeting: `Hi ${name},`,
      intro: "Thank you for reaching out to Quantum Technology Agency!",
      received: "We received your diagnosis request and our team is already analyzing your project.",
      nextSteps: "<strong>Next steps:</strong>",
      step1: "<strong>1. Initial analysis</strong> — We'll review all the details you shared with us.",
      step2: "<strong>2. Full diagnosis</strong> — Within <strong>24 hours</strong>, you'll receive a complexity report with estimated hours and investment.",
      step3: "<strong>3. Call scheduling</strong> — If you'd like, we can schedule a 30–60 minute conversation to align details and answer questions.",
      contact: "If you have any questions before that, feel free to reply to this email or reach us on WhatsApp.",
      closing: "We're excited to help you bring this project to life!",
    },
    es: {
      subject: "✅ Recibimos tu solicitud — Diagnóstico en hasta 24h",
      greeting: `Hola ${name},`,
      intro: "¡Gracias por contactar con Quantum Technology Agency!",
      received: "Recibimos tu solicitud de diagnóstico y nuestro equipo ya está analizando tu proyecto.",
      nextSteps: "<strong>Próximos pasos:</strong>",
      step1: "<strong>1. Análisis inicial</strong> — Revisaremos todos los detalles que compartiste con nosotros.",
      step2: "<strong>2. Diagnóstico completo</strong> — En hasta <strong>24 horas</strong>, recibirás un informe de complejidad con estimación de horas e inversión.",
      step3: "<strong>3. Agendar llamada</strong> — Si quieres, podemos agendar una conversación de 30–60 minutos para alinear detalles y responder preguntas.",
      contact: "Si tienes alguna duda antes de eso, puedes responder a este email o contactarnos por WhatsApp.",
      closing: "¡Estamos emocionados de ayudarte a hacer realidad este proyecto!",
    },
  };

  const t = copy[locale];

  return {
    subject: t.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
        ${emailLogoHeader("light")}
        
        <p style="font-size:16px;line-height:1.6">${t.greeting}</p>
        
        <p style="font-size:16px;line-height:1.6">${t.intro}</p>
        
        <p style="font-size:16px;line-height:1.6">${t.received}</p>
        
        <p style="font-size:16px;line-height:1.6;margin-top:24px">${t.nextSteps}</p>
        
        <ul style="font-size:15px;line-height:1.8;padding-left:20px">
          <li>${t.step1}</li>
          <li>${t.step2}</li>
          <li>${t.step3}</li>
        </ul>
        
        <p style="font-size:16px;line-height:1.6;margin-top:24px">${t.contact}</p>
        
        <p style="font-size:16px;line-height:1.6;margin-top:24px">${t.closing}</p>
        
        ${emailFooterTeam()}
      </div>
    `,
  };
}

/**
 * Template de e-mail de follow-up após 3 dias sem resposta do lead.
 */
export function tplLeadFollowUp3Days(name: string, locale: InviteLocale = "pt") {
  const copy = {
    pt: {
      subject: "Ainda interessado? — Diagnóstico do seu projeto",
      greeting: `Olá ${name},`,
      intro: "Enviamos o diagnóstico do seu projeto há alguns dias e não tivemos retorno.",
      question: "Ainda está interessado em avançar com o projeto?",
      offer: "Se tiver alguma dúvida sobre o relatório ou quiser agendar uma conversa para alinhar detalhes, é só responder este e-mail.",
      closing: "Estamos à disposição para ajudar!",
    },
    en: {
      subject: "Still interested? — Your project diagnosis",
      greeting: `Hi ${name},`,
      intro: "We sent the diagnosis of your project a few days ago and haven't heard back.",
      question: "Are you still interested in moving forward with the project?",
      offer: "If you have any questions about the report or want to schedule a conversation to align details, just reply to this email.",
      closing: "We're here to help!",
    },
    es: {
      subject: "¿Aún interesado? — Diagnóstico de tu proyecto",
      greeting: `Hola ${name},`,
      intro: "Enviamos el diagnóstico de tu proyecto hace algunos días y no tuvimos respuesta.",
      question: "¿Aún estás interesado en avanzar con el proyecto?",
      offer: "Si tienes alguna duda sobre el informe o quieres agendar una conversación para alinear detalles, solo responde a este email.",
      closing: "¡Estamos a disposición para ayudarte!",
    },
  };

  const t = copy[locale];

  return {
    subject: t.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
        ${emailLogoHeader("light")}
        
        <p style="font-size:16px;line-height:1.6">${t.greeting}</p>
        
        <p style="font-size:16px;line-height:1.6">${t.intro}</p>
        
        <p style="font-size:16px;line-height:1.6;margin-top:20px">${t.question}</p>
        
        <p style="font-size:16px;line-height:1.6">${t.offer}</p>
        
        <p style="font-size:16px;line-height:1.6;margin-top:24px">${t.closing}</p>
        
        ${emailFooterTeam()}
      </div>
    `,
  };
}

/**
 * Template de e-mail de follow-up após 7 dias sem resposta (último follow-up antes de arquivar).
 */
export function tplLeadFollowUp7Days(name: string, locale: InviteLocale = "pt") {
  const copy = {
    pt: {
      subject: "Última chamada — Projeto ainda em aberto?",
      greeting: `Olá ${name},`,
      intro: "Este é nosso último contato sobre o diagnóstico que enviamos.",
      question: "Se ainda houver interesse, podemos retomar a conversa a qualquer momento — basta responder este e-mail.",
      archive: "Caso contrário, vamos arquivar sua solicitação e não faremos mais contato ativo.",
      closing: "De qualquer forma, agradecemos pelo contato inicial e desejamos sucesso no seu projeto!",
    },
    en: {
      subject: "Last call — Project still open?",
      greeting: `Hi ${name},`,
      intro: "This is our last contact about the diagnosis we sent.",
      question: "If you're still interested, we can resume the conversation anytime — just reply to this email.",
      archive: "Otherwise, we'll archive your request and won't make any more active contact.",
      closing: "Either way, thank you for the initial contact and we wish you success in your project!",
    },
    es: {
      subject: "Última llamada — ¿Proyecto aún abierto?",
      greeting: `Hola ${name},`,
      intro: "Este es nuestro último contacto sobre el diagnóstico que enviamos.",
      question: "Si aún hay interés, podemos retomar la conversación en cualquier momento — solo responde a este email.",
      archive: "En caso contrario, archivaremos tu solicitud y no haremos más contacto activo.",
      closing: "De cualquier manera, ¡gracias por el contacto inicial y te deseamos éxito en tu proyecto!",
    },
  };

  const t = copy[locale];

  return {
    subject: t.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
        ${emailLogoHeader("light")}
        
        <p style="font-size:16px;line-height:1.6">${t.greeting}</p>
        
        <p style="font-size:16px;line-height:1.6">${t.intro}</p>
        
        <p style="font-size:16px;line-height:1.6;margin-top:20px">${t.question}</p>
        
        <p style="font-size:16px;line-height:1.6">${t.archive}</p>
        
        <p style="font-size:16px;line-height:1.6;margin-top:24px">${t.closing}</p>
        
        ${emailFooterTeam()}
      </div>
    `,
  };
}
