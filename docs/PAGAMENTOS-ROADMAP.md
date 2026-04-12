# Roadmap de Pagamentos — Quantum Technology

**Data de início:** Abril 2026  
**Modelo de negócio:** Agência de desenvolvimento de software (serviços B2B — projetos, funcionalidades, suporte)  
**Sede:** Portugal  
**Mercados-alvo:** Europa · Brasil · EUA (prioridade igual)

---

## 1. Estado Atual da Plataforma

### O que já existe
| Componente | Ficheiro | Estado |
|---|---|---|
| Integração Stripe | `src/lib/stripe.ts` | ✅ Produção |
| `POST /api/orders/payment` | `src/app/api/orders/payment/route.ts` | ✅ Produção (auth + anti-IDOR) |
| Service de pagamento | `src/services/orders/paymentService.ts` | ✅ Cria `PaymentIntent` + email |
| Modelo `Payment` no Prisma | `prisma/schema.prisma` | ✅ `stripePaymentIntent`, `stripeSessionId`, `amountCents`, `status` |

### Limitações atuais
- Apenas `PaymentIntent` raw — sem UI de checkout (cartão nunca chega a ser coletado no cliente)
- Moeda fixada em `EUR` no código (`currency: 'eur'`)
- Sem suporte a PIX (Brasil)
- Sem suporte a ACH / métodos locais nos EUA
- Sem webhook do Stripe para confirmação assíncrona de pagamento

---

## 2. Análise de Necessidades por Mercado

### 🇪🇺 Europa (Portugal, UE)
- **Método principal:** Cartão (Visa/Mastercard/Amex)
- **Métodos alternativos relevantes:** SEPA Direct Debit (recorrente B2B), MB Way (Portugal)
- **Moeda:** EUR
- **Stripe cobre?** ✅ Sim — nativo, sem parceiro adicional
- **Fiscal:** IVA gerido pela empresa (23% PT) — Stripe Tax pode automatizar

### 🇧🇷 Brasil
- **Método principal:** PIX (instantâneo, zero custo p/ pagador)
- **Métodos alternativos:** Cartão de crédito (preferencialmente parcelado), Boleto
- **Moeda:** BRL (convertido para EUR na liquidação)
- **Stripe cobre PIX?** ❌ Não — o Stripe não oferece PIX para empresas fora do Brasil
- **Solução identificada:** Gateway complementar (ver Fase 2)
- **Contexto B2B:** Clientes corporativos geralmente têm cartão internacional → PIX é diferencial mas não bloqueante

### 🇺🇸 EUA
- **Método principal:** Cartão (Visa/Mastercard/Amex)
- **Métodos alternativos:** ACH (transferência bancária, comum em B2B), Apple Pay / Google Pay
- **Moeda:** USD (convertido para EUR na liquidação)
- **Stripe cobre?** ✅ Sim — nativo, incluindo ACH Debit e carteiras digitais
- **Fiscal:** Sales Tax varia por estado — sem obrigação imediata para empresa PT abaixo dos thresholds

---

## 3. Avaliação dos Provedores

### Por que NÃO adotar Merchant of Record (Paddle, Lemon Squeezy)
Soluções MoR (Paddle, LemonSqueezy, PayPro Global) são desenhadas para **venda de software/SaaS** (licenças, assinaturas de produto). Para uma **agência que fatura serviços** (projetos, suporte), esses provedores:
- Não se aplicam ao modelo de faturação (invoice por projeto)
- Cobram 5% + $0.50 por transação (vs. ~2.9% + €0.25 do Stripe)
- Criam complexidade desnecessária (gestão de licenças, gestão de IVA automática que a empresa já faz)

### Comparativo para o contexto da agência

| Provedor | Europa | Brasil | EUA | Custo | Decisão |
|---|---|---|---|---|---|
| **Stripe** | ✅ Nativo | ❌ Sem PIX | ✅ Nativo | 2.9% + €0.25 | ✅ **Base — manter** |
| **Paddle** | ✅ MoR | ⚠️ PIX só 1-time | ✅ | 5% + $0.50 | ❌ Modelo errado p/ agência |
| **Nuvei** | ✅ Adquirente local | ✅ Adquirente local | ✅ Adquirente local | Sob consulta | 🔮 Opção futura (vol. alto) |
| **Fondy** | ✅ (foco PT/UE) | ✅ PIX incluído | ✅ | ~2-3% | 🟡 Avaliar para Fase 2 |
| **Pagsmile** | ✅ SEPA | ✅ PIX nativo | ✅ ACH | Sob consulta | 🟡 Avaliar para Fase 2 |
| **Asaas / Pagar.me** | ❌ Só BR | ✅✅ PIX + parcelado | ❌ | ~0.99-2.5% | 🟡 BR-only complementar |

### Recomendação estratégica
```
Stripe (base)  →  Europa ✅ + EUA ✅
     +
Gateway BR     →  Brasil ✅ (PIX + cartão BRL)
```

Para o gateway BR, avaliar por ordem de preferência:
1. **Fondy** — já cobre PT/UE também, checkout unificado possível
2. **Asaas (Efí)** — API excelente, PIX nativo, fácil integração, gratuito p/ emissão
3. **Pagsmile** — infraestrutura profunda mas integração mais pesada

---

## 4. Roadmap de Implementação

### Fase 0 — Fundação Stripe (IMEDIATO — semanas 1-2)
**Objetivo:** Fazer o fluxo de pagamento atual funcionar end-to-end de forma utilizável.

O `paymentService.ts` cria um `PaymentIntent` mas nunca devolve o `client_secret` ao frontend — o cliente não consegue introduzir o cartão hoje.

**Tarefas:**
- [ ] `POST /api/orders/payment` → devolver `clientSecret` no response
- [ ] Criar página `/portal/orders/[id]/pagar` com `@stripe/react-stripe-js` + `PaymentElement`
- [ ] Implementar `POST /api/webhooks/stripe` para receber `payment_intent.succeeded` e atualizar `Payment.status → PAID`
- [ ] Adicionar `STRIPE_WEBHOOK_SECRET` ao `.env` e configurar no Stripe Dashboard
- [ ] Testar com cartão de teste Stripe (`4242 4242 4242 4242`)

**Impacto no schema:** Nenhum — já existe `stripePaymentIntent` e `status`

---

### Fase 1 — Suporte a Múltiplas Moedas no Stripe (semanas 3-4)
**Objetivo:** Clientes EUA pagam em USD, UE em EUR, sem friction de câmbio.

**Tarefas:**
- [ ] Detetar moeda preferida pelo utilizador (via `User.country` ou por seleção manual)
- [ ] Modificar `createPayment()` para aceitar `currency` como parâmetro
- [ ] Atualizar `Payment` schema: adicionar `currency String @default("eur")`
- [ ] Stripe converte automaticamente e liquida em EUR para a conta PT
- [ ] Ativar Apple Pay / Google Pay no `PaymentElement` (zero código adicional)

**Schema change:**
```prisma
model Payment {
  // ...campos existentes...
  currency    String  @default("eur")  // novo
  amountLocal Float?                   // novo — valor original na moeda do cliente
}
```

**Migration:** Não-destrutiva (campos opcionais)

---

### Fase 2 — Gateway Brasileiro (PIX) (mês 2)
**Objetivo:** Clientes brasileiros pagam via PIX ou cartão BRL.

**Decisão prévia necessária:** Escolher entre Fondy, Asaas ou Pagsmile (fazer PoC antes de commitar).

**Tarefas (após escolha do provedor):**
- [ ] Criar `src/lib/pix.ts` (inicialização do SDK/API do provedor escolhido)
- [ ] Atualizar `Payment` schema:
  ```prisma
  provider          String  @default("stripe")  // "stripe" | "pix_fondy" | "pix_asaas"
  pixKey            String?   // chave copia-e-cola
  pixQrCode         String?   // base64 ou URL do QR Code
  pixExpires        DateTime? // PIX expira (geralmente 30-60min)
  ```
- [ ] `POST /api/orders/payment` → detetar país do cliente e criar PIX ou PaymentIntent conforme
- [ ] Criar página `/portal/orders/[id]/pagar` com branch para exibir QR Code PIX
- [ ] Webhook do provedor BR → `POST /api/webhooks/pix` → atualizar `Payment.status → PAID`
- [ ] Polling fallback: se webhook falhar, verificar status a cada 30s (SDK do provedor)

**Migration:** Não-destrutiva (provider default `"stripe"`, campos PIX opcionais)

---

### Fase 3 — Painel Admin de Pagamentos (mês 3)
**Objetivo:** ADMIN consegue ver todos os pagamentos, estado e moeda, com filtros.

**Tarefas:**
- [ ] Página `/admin/pagamentos` — listagem com colunas: Cliente, Pedido, Valor, Moeda, Provedor, Estado, Data
- [ ] Filtros: por estado (PENDING/PAID/FAILED), por provedor, por período
- [ ] Ação "Marcar como pago manualmente" (para transferências bancárias B2B)
- [ ] Link direto para o PaymentIntent no Stripe Dashboard (para debugging)
- [ ] Exportar CSV dos pagamentos (para faturação)

---

### Fase 4 — Conformidade Fiscal (mês 4+)
**Objetivo:** Gestão automática de IVA EU e Sales Tax USA.

**Análise:**
- **Portugal/UE:** IVA 23% — a empresa já tem obrigação de gerir. Stripe Tax (0.5%/transação) pode automatizar mas é custo adicional. Alternativa: NIF/VAT do cliente no checkout e gestão manual.
- **EUA:** Sales Tax — obrigação apenas acima de ~$100k/ano por estado (Nexus). Abaixo disso: sem ação imediata.
- **Brasil:** ISS — obrigação da empresa PT emitir invoice conforme legislação PT (serviços exportados). Fora do escopo do gateway.

**Tarefas (quando volume justificar):**
- [ ] Avaliar Stripe Tax vs. gestão manual
- [ ] Campo `vatNumber` no `User` para clientes UE (reverse charge B2B)
- [ ] Gerar PDF de fatura por pagamento concluído

---

## 5. Alterações ao Schema Completas (visão consolidada)

```prisma
model Payment {
  id                   String        @id @default(cuid())
  orderId              String        @unique
  order                Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  // Fase 0 (já existe)
  stripePaymentIntent  String?
  stripeSessionId      String?
  amountCents          Int
  status               PaymentStatus @default(PENDING)
  
  // Fase 1 (multi-moeda)
  currency             String        @default("eur")   // ← NOVO
  amountLocal          Float?                          // ← NOVO
  
  // Fase 2 (PIX)
  provider             String        @default("stripe") // ← NOVO
  pixKey               String?                          // ← NOVO
  pixQrCode            String?                          // ← NOVO
  pixExpires           DateTime?                        // ← NOVO
  
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
}

// Adicionar ao model User (Fase 1)
model User {
  // ...campos existentes...
  country   String?  // "PT" | "BR" | "US" — para detetar moeda ← NOVO
  vatNumber String?  // NIF/NIPC para B2B EU ← NOVO
}
```

---

## 6. Variáveis de Ambiente Necessárias

```env
# Fase 0 — Stripe Webhooks (já tem STRIPE_SECRET_KEY)
STRIPE_WEBHOOK_SECRET=whsec_...

# Fase 2 — Gateway BR (preencher após escolha do provedor)
PIX_PROVIDER=asaas         # ou "fondy" | "pagsmile"
ASAAS_API_KEY=...          # se usar Asaas
FONDY_MERCHANT_ID=...      # se usar Fondy
FONDY_SECRET_KEY=...       # se usar Fondy
```

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Gateway BR indisponível | Baixa | Alto | Fallback: exibir cartão internacional + mensagem "PIX indisponível" |
| Webhook PIX não recebido | Média | Alto | Polling de status na page de checkout (30s interval) |
| Cliente paga e falha a atualizar status | Média | Alto | Idempotency key no Stripe + re-processamento de webhooks |
| Fraude (cliente disputa pagamento) | Baixa | Médio | Stripe Radar já ativo; guardar IP + user-agent no `Payment` |
| Câmbio adverso (BRL/EUR) | Alta | Baixo | Liquidação diária pelo provedor; sem exposição longa |

---

## 8. Decisões Pendentes

- [ ] **Escolha do gateway BR:** Agendar PoC com Fondy (checkout unificado) vs. Asaas (API BR madura)
- [ ] **Stripe Tax:** Avaliar custo (0.5%) vs. benefício de automação fiscal UE
- [ ] **Parcelamento no Brasil:** Decidir se vai oferecer (requer gateway BR que suporte) — diferencial para tickets altos
- [ ] **Recorrência/retainer:** Se a agência tiver clientes de suporte mensal, avaliar Stripe Subscriptions vs. invoice manual

---

*Documento mantido em `/docs/PAGAMENTOS-ROADMAP.md`. Atualizar conforme cada fase for concluída.*
