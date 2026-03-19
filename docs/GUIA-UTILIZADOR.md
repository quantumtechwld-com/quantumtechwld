# DevFlow — Guia de Utilizador

> **Plataforma:** DevFlow / Quantum Technology Agency  
> **Versão:** M4 (março 2026)  
> **Público:** Clientes e Administradores

---

## Índice

1. [Visão geral da plataforma](#1-visão-geral-da-plataforma)
2. [Acesso e autenticação](#2-acesso-e-autenticação)
3. [Guia do Cliente — Briefing](#3-guia-do-cliente--briefing)
4. [Guia do Cliente — Portal](#4-guia-do-cliente--portal)
5. [Guia do Cliente — Pedidos](#5-guia-do-cliente--pedidos)
6. [Guia do Administrador — Briefings e Propostas](#6-guia-do-administrador--briefings-e-propostas)
7. [Guia do Administrador — Pedidos](#7-guia-do-administrador--pedidos)
8. [Fluxos completos (diagramas)](#8-fluxos-completos)
9. [FAQ](#9-faq)

---

## 1. Visão geral da plataforma

O DevFlow é o sistema de gestão de projetos da Quantum Technology Agency. Centraliza três fluxos principais:

| Fluxo | Quem usa | O que faz |
|-------|----------|-----------|
| **Briefing** | Novos clientes | Submetem um projeto novo via wizard inteligente |
| **Propostas** | Admin + Cliente | Negociação e aprovação do escopo/orçamento |
| **Pedidos** | Clientes existentes | Solicitam suporte, novas features ou projetos adicionais |

---

## 2. Acesso e autenticação

### 2.1 Primeiro acesso (cliente novo)

1. Acesse a página principal: `https://seudominio.com`
2. Descreva o seu projeto no campo de texto livre e clique **"Analisar com IA"**, ou preencha o wizard passo a passo
3. No final do wizard, forneça o seu e-mail e nome
4. Receberá um **link mágico** no e-mail — clique nele para entrar no portal
5. O link expira em 24 horas; se expirar, basta voltar a `/portal/login` e solicitar um novo

### 2.2 Acesso recorrente

1. Acesse `/portal/login`
2. Insira o seu e-mail e clique **"Enviar link de acesso"**
3. Verifique a caixa de entrada (e pasta de spam) e clique no link recebido

> **Nota:** Não há password. O sistema usa links de acesso únicos por e-mail — mais seguro e sem necessidade de memorizar password.

### 2.3 Admin

1. Acesse `/portal/login` com o e-mail de administrador
2. O sistema redireciona automaticamente para `/admin` após a autenticação

---

## 3. Guia do Cliente — Briefing

> Use este fluxo quando quiser iniciar um **projeto completamente novo**.

### Passo 1 — Descrever o projeto

Na página inicial existem duas opções:

**Opção A — Análise com IA (recomendado)**
1. Escreva uma descrição livre do seu projeto no campo de texto grande (ex.: "Quero uma plataforma de e-commerce com pagamento integrado para vender cursos online...")
2. Clique **"Analisar com IA"**
3. A IA extrai automaticamente: tipo de projeto, dores, funcionalidades, orçamento e prazo
4. O wizard é pré-preenchido com as informações extraídas

**Opção B — Wizard manual**
1. Clique **"Preencher manualmente"**
2. Siga as 5 etapas do wizard

### Passo 2 — Wizard (5 etapas)

| Etapa | O que preencher |
|-------|----------------|
| 1. Tipo de projeto | Site, App, SaaS, E-commerce, App Mobile, Personalizado |
| 2. Contexto | Dores do negócio, público-alvo |
| 3. Funcionalidades | Selecione as features desejadas (ex.: autenticação, pagamentos, painel admin) |
| 4. Orçamento e prazo | Faixa de investimento + prazo desejado |
| 5. Contacto | Nome e e-mail |

> No final da etapa 4, o sistema calcula automaticamente um **Score de Complexidade (1–10)** com estimativa de horas.

### Passo 3 — Projectos similares

Após a análise por IA, o sistema mostra projetos semelhantes já entregues pela agência como referência de escopo e orçamento.

### Passo 4 — Submissão

1. Clique **"Submeter briefing"** na etapa final
2. Receberá um e-mail com o link mágico de acesso ao portal
3. O briefing fica com estado **"Recebido"** enquanto a equipa analisa

---

## 4. Guia do Cliente — Portal

Após fazer login, acede ao seu portal pessoal em `/portal`.

### O que vê no portal

- **Os seus projetos (Briefings):** Lista de todos os briefings submetidos com badge de estado
- **Navegação rápida:** Pedidos · Biblioteca · Sair

### Estados de um briefing

| Estado | Significado |
|--------|-------------|
| Recebido | A equipa ainda não iniciou a análise |
| Em análise | A equipa está a analisar e a preparar proposta |
| Proposta enviada | Tem uma proposta à espera da sua resposta |
| Em negociação | Está a negociar detalhes com a equipa |
| Aprovado | Projeto aprovado, a aguardar início |
| Em desenvolvimento | O projeto está em curso |
| Entregue | Projeto concluído ✓ |

### Ver detalhe de um briefing

1. Clique num briefing da lista
2. Vê: tipo, funcionalidades, orçamento, prazo, score de complexidade e estado atual
3. Se houver uma proposta, verá o botão **"Ver proposta"**

---

## 5. Guia do Cliente — Pedidos

> Use este fluxo quando já é cliente e quer solicitar algo novo (feature, suporte, bug, etc.).

### 5.1 Criar um novo pedido

1. No portal, clique **"Pedidos"** no menu
2. Clique **"+ Novo pedido"**
3. Preencha o formulário:

| Campo | Descrição |
|-------|-----------|
| **Tipo de pedido** | Nova funcionalidade / Correção de bug / Novo projeto / Suporte técnico / Outro |
| **Descrição detalhada** | Explique o que pretende, contexto e detalhes relevantes |
| **Urgência** | Baixa · Normal · Alta · Crítica |

4. Clique **"Enviar pedido"**
5. É redirecionado para a lista de pedidos; o novo pedido aparece com estado **"Pendente"**

> Um e-mail é automaticamente enviado à equipa com os detalhes do pedido.

### 5.2 Acompanhar um pedido

1. Na lista de pedidos, clique no pedido que quer consultar
2. Vê todos os detalhes: tipo, descrição, urgência, estado

### 5.3 Estados de um pedido

| Estado | Significado | Ação disponível |
|--------|-------------|-----------------|
| Pendente | Aguarda análise da equipa | — |
| Em análise | Uma equipa está a avaliar | — |
| Proposta enviada | A equipa enviou uma proposta com valor e prazo | ✅ Aprovar / Pedir revisão / Recusar |
| Aprovado | Aprovado, a aguardar produção | — |
| Revisão solicitada | Pediu alterações à proposta | Aguarda nova proposta |
| Recusado | Pedido recusado | — |
| Em produção | A equipa iniciou os trabalhos | — |
| Concluído | Pedido entregue ✓ | — |

### 5.4 Responder a uma proposta

Quando o estado é **"Proposta enviada"**, aparece uma secção com:
- Informações de produção (o que será feito e como)
- Valor estimado em €
- Nota adicional da equipa (se houver)

Tem 3 opções:

**Aprovar proposta**
1. Leia as informações de produção e o valor
2. Opcionalmente, deixe uma nota
3. Clique **"Aprovar proposta"**
4. Confirme na janela de confirmação
5. A equipa recebe notificação e avança para produção

**Pedir revisão**
1. Escreva no campo de nota o que precisa de ser alterado (obrigatório)
2. Clique **"Pedir revisão"**
3. A equipa recebe a sua nota e envia nova proposta

**Recusar**
1. Clique **"Recusar"**
2. Confirme na janela de confirmação

---

## 6. Guia do Administrador — Briefings e Propostas

### 6.1 Acesso ao painel admin

Após login com conta admin em `/portal/login`, é redirecionado para `/admin`.

### 6.2 Dashboard admin

Mostra:
- Total de briefings
- Briefings recebidos (novos)
- Em desenvolvimento
- Entregues
- Tabela completa com todos os briefings, estado e cliente

### 6.3 Gerir um briefing

1. Na tabela do dashboard, clique no briefing
2. Vê todos os dados: cliente, tipo, features, complexidade, orçamento, prazo
3. No painel à direita, pode alterar o **estado do briefing** (dropdown)

### 6.4 Gerar proposta com IA

1. No detalhe de um briefing, clique **"Gerar proposta com IA"**
2. A IA analisa o briefing e rascunha uma proposta com escopo, prazo e valor
3. Reveja e edite o texto gerado
4. Clique **"Enviar proposta ao cliente"**
5. O cliente recebe e-mail e pode ver a proposta no portal

### 6.5 Gerir comentários na proposta

- Veja os comentários do cliente na aba de comentários
- Responda diretamente no painel
- Marque comentários como resolvidos

### 6.6 Alterar estado do briefing

Estados disponíveis e quando usar:

| Estado | Quando usar |
|--------|-------------|
| Recebido | Estado inicial (automático) |
| Em análise | Quando começar a analisar |
| Proposta enviada | Após enviar proposta (automático) |
| Em negociação | Quando o cliente está a negociar |
| Aprovado | Quando o cliente aprova |
| Em desenvolvimento | Quando iniciar o desenvolvimento |
| Entregue | Quando o projeto for entregue |

---

## 7. Guia do Administrador — Pedidos

### 7.1 Aceder à lista de pedidos

1. No header do admin, clique **"Pedidos"** ou aceda diretamente a `/admin/orders`

### 7.2 Filtrar pedidos

No topo da página há filtros por estado. Clique num estado para filtrar:
- Pendentes, Em análise, Proposta enviada, Aprovados, Revisão, Recusados, Em produção, Concluídos

Os números ao lado de cada estado mostram quantos pedidos estão nesse estado.

### 7.3 Avaliar um pedido

1. Clique num pedido da lista para abrir o detalhe
2. Vê: tipo de pedido, cliente, urgência, descrição detalhada
3. Avalie o pedido internamente

### 7.4 Enviar proposta ao cliente

1. No detalhe do pedido (estado: Pendente, Em análise ou Revisão), preencha:

| Campo | Descrição |
|-------|-----------|
| **Informações de produção** | O que será feito, como e em quanto tempo (obrigatório) |
| **Valor estimado (€)** | Orçamento em euros (obrigatório) |
| **Nota adicional** | Perguntas, condicionantes ou observações (opcional) |

2. Clique **"Enviar proposta"**
3. O cliente recebe um e-mail com um link para ver a proposta
4. O estado muda automaticamente para **"Proposta enviada"**

### 7.5 Marcar em produção

Quando o cliente aprovar a proposta:
1. O estado muda para **"Aprovado"**
2. Quando iniciar os trabalhos, clique **"Marcar em produção"**
3. Confirme a acção
4. O cliente recebe e-mail a informar que os trabalhos começaram

### 7.6 Marcar como concluído

Quando a entrega estiver feita:
1. No detalhe do pedido (estado: Em produção), clique **"Marcar concluído"**
2. Confirme a acção
3. O cliente recebe e-mail de conclusão

### 7.7 Responder a um pedido de revisão

Quando o cliente pede revisão:
1. O estado muda para **"Revisão solicitada"**
2. Vea a nota do cliente na secção "Pedido de revisão do cliente"
3. Ajuste a proposta e clique novamente **"Enviar proposta"** com os novos dados

---

## 8. Fluxos completos

### Fluxo A — Novo cliente submete briefing

```
Cliente acede a /
  → Descreve projeto (IA ou manual)
  → Wizard 5 etapas
  → Recebe score de complexidade
  → Submete → recebe magic link por e-mail
  → Acede ao portal → vê briefing com estado "Recebido"
  
Admin acede a /admin
  → Vê briefing na tabela
  → Altera estado para "Em análise"
  → Gera/escreve proposta → envia
  
Cliente recebe e-mail
  → Acede ao portal → vê proposta
  → Comenta/aprova/negocia

Admin aprova → estado "Aprovado"
  → Inicia desenvolvimento → "Em desenvolvimento"
  → Conclui → "Entregue"
```

### Fluxo B — Cliente existente faz pedido

```
Cliente acede ao portal → "Pedidos" → "Novo pedido"
  → Preenche: tipo, descrição, urgência
  → Submete → estado "Pendente"
  → Admin recebe e-mail com detalhes

Admin acede a /admin/orders
  → Vê pedido pendente
  → Preenche proposta (produção + valor)
  → Envia → estado "Proposta enviada"
  
Cliente recebe e-mail
  → Acede ao pedido → vê proposta
  → Aprova / Pede revisão / Recusa

Se aprovado:
  Admin → "Marcar em produção" → cliente recebe e-mail
  Admin → "Marcar concluído" → cliente recebe e-mail
```

### Fluxo C — Ciclo de vida resumido (pedido)

```
PENDENTE → AVALIANDO → PROPOSTA_ENVIADA → APROVADO → EM_PRODUÇÃO → CONCLUÍDO
                                        ↓
                                   REVISÃO → (volta a PROPOSTA_ENVIADA)
                                        ↓
                                   RECUSADO
```

---

## 9. FAQ

**Q: Não recebi o link de acesso por e-mail. O que faço?**  
A: Verifique a pasta de spam. Se não estiver lá, aguarde 2–3 minutos e tente novamente em `/portal/login`. O link expira após 24 horas.

**Q: Posso ter vários briefings ativos ao mesmo tempo?**  
A: Sim. O portal mostra todos os seus briefings e pode submeter novos a qualquer momento.

**Q: Qual a diferença entre um briefing e um pedido?**  
A: Um **briefing** é para projetos completamente novos (primeiro contacto). Um **pedido** é para clientes já cadastrados que querem solicitar algo adicional (feature, suporte, bug, etc.).

**Q: Posso editar um pedido depois de submetido?**  
A: Não diretamente. Se precisar de alterar informações, adicione uma nota no campo de revisão quando receber a proposta, explicando o que mudou.

**Q: O valor na proposta é definitivo?**  
A: O valor é uma estimativa. Se precisar de ajustes, use a opção **"Pedir revisão"** e explique o que quer alterar. A equipa enviará uma nova proposta.

**Q: Como sei que o meu pedido foi recebido?**  
A: O pedido aparece imediatamente no portal com estado "Pendente". A equipa também recebe um e-mail automático com os detalhes.

**Q: Posso submeter um pedido sem fazer login?**  
A: Não. Os pedidos estão disponíveis apenas para clientes já registados no portal.

**Q: (Admin) Como altero o estado de um briefing para "Em análise"?**  
A: No detalhe do briefing em `/admin/briefing/[id]`, use o selector de estado no painel lateral direito.

**Q: (Admin) Posso reenviar uma proposta após o cliente pedir revisão?**  
A: Sim. Quando o estado é "Revisão solicitada", o formulário de proposta fica disponível novamente. Preencha os novos dados e clique "Enviar proposta".

---

*Última actualização: março 2026 — DevFlow M4*
