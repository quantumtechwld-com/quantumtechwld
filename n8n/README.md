# Workflow n8n — Captura de Lead

Arquivo de importação: `workflow-lead-capture.json`

## O que este workflow faz
- Recebe `POST /webhook/lead-capture`
- Valida campos obrigatórios: `name`, `email`, `service`, `budget`, `message`
- Retorna:
  - `200` com payload do lead quando válido
  - `400` quando faltam campos

## Como importar no n8n
1. No n8n, clique em **Import from file**.
2. Selecione `workflow-lead-capture.json`.
3. Abra o nó **Webhook Lead** e copie a **Production URL**.
4. Ative o workflow (**Active = ON**).

## Como ligar ao site da agência
No projeto `agency-site`, configure no `.env.local`:

```env
N8N_WEBHOOK_URL=https://SEU-N8N/webhook/lead-capture
```

Depois reinicie o Next.js (`npm run dev`).

## Payload esperado do site
```json
{
  "name": "Ricardo Oliveira",
  "email": "ricardo@email.com",
  "company": "Orange",
  "service": "Aplicação web completa",
  "budget": "Até €3.000",
  "message": "Desejo ganhar + dinheiro"
}
```

## Próxima evolução (opcional)
- Enviar lead para Google Sheets, Notion ou CRM
- Disparar notificação no WhatsApp/Telegram
- Aplicar score automático no próprio workflow
