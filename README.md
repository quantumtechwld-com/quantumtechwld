# Agency Site — Apex Dev Studio

Landing page premium para agência de desenvolvimento de software com:
- apresentação de serviços e proposta de valor;
- formulário de briefing para captação de lead;
- endpoint interno para envio de lead ao webhook do n8n.

## Executar localmente

1. Instale dependências:

```bash
npm install
```

2. Configure variáveis de ambiente:

```bash
cp .env.example .env.local
```

3. Ajuste a variável `N8N_WEBHOOK_URL` em `.env.local`.

4. Inicie o projeto:

```bash
npm run dev
```

5. Acesse `http://localhost:3000`.

## Fluxo de lead

- O formulário da home envia dados para `POST /api/lead`.
- A rota valida os campos e encaminha o payload para `N8N_WEBHOOK_URL`.
- Se a URL do webhook não estiver configurada, o lead é aceito localmente e registrado no log.

Payload enviado ao n8n:

```json
{
	"name": "Nome",
	"email": "email@dominio.com",
	"company": "Empresa",
	"service": "Automação com n8n + IA",
	"budget": "€3.000 - €8.000",
	"message": "Detalhes do projeto",
	"source": "agency-site",
	"receivedAt": "2026-02-21T12:00:00.000Z"
}
```

## Build de produção

```bash
npm run build
npm run start
```
