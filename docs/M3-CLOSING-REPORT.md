# M3 — Relatório de Fechamento

**Projeto:** Quantum Technology Agency  
**Ciclo:** M3  
**Objetivo do ciclo:** proteger o frontend crítico do portal e do admin contra regressões  
**Status do ciclo:** concluído tecnicamente e pronto para fechamento operacional

---

## 1. Resumo executivo

O M3 foi concluído com foco na superfície crítica de frontend do produto.

O projeto saiu de uma cobertura praticamente inexistente de UI para um estado com proteção automatizada das páginas, componentes e interações centrais do portal e do admin.

O risco principal deste ciclo era continuar dependente de validação manual nos fluxos mais acessados. Esse risco foi reduzido de forma relevante.

---

## 2. Entregas concluídas

| Entrega | Status | Evidência |
|---|---|---|
| Login do portal coberto | Concluído | teste de página criado |
| Criação de pedido coberta | Concluído | formulário do pedido coberto |
| Detalhe de pedido do cliente coberto | Concluído | página e ações do cliente cobertas |
| Pagamento e sucesso de pagamento cobertos | Concluído | botão de pagamento, invoice e success page cobertos |
| Portal principal coberto | Concluído | dashboard do cliente coberto |
| Perfil do cliente coberto | Concluído | página e formulário cobertos |
| Briefing do cliente coberto | Concluído | briefing detail, proposta, ações e comentários cobertos |
| Briefings admin cobertos | Concluído | tabela, detalhe e gestão de status cobertos |
| Orders admin cobertos | Concluído | listagem, detalhe e ações do admin cobertos |
| Dashboard admin coberto | Concluído | atalhos, blocos e tabelas principais cobertos |
| Gestão de utilizadores coberta | Concluído | página admin e UsersClient cobertos |
| Contatos admin cobertos | Concluído | listagem vazia e preenchida cobertas |

---

## 3. Evidências técnicas do M3

### Áreas do portal cobertas

- `tests/components/LoginPage.test.tsx`
- `tests/components/NewOrderForm.test.tsx`
- `tests/components/OrderList.test.tsx`
- `tests/components/OrderDetailPage.test.tsx`
- `tests/components/OrderClientActions.test.tsx`
- `tests/components/PayOrderButton.test.tsx`
- `tests/components/PaymentSuccessPage.test.tsx`
- `tests/components/InvoicePage.test.tsx`
- `tests/components/PortalPage.test.tsx`
- `tests/components/ProfilePage.test.tsx`
- `tests/components/ProfileForm.test.tsx`
- `tests/components/RatingWidget.test.tsx`
- `tests/components/BriefingDetailPage.test.tsx`
- `tests/components/ProposalPage.test.tsx`
- `tests/components/ProposalActions.test.tsx`
- `tests/components/ProposalComments.test.tsx`

### Áreas do admin cobertas

- `tests/components/AllBriefingsTable.test.tsx`
- `tests/components/AdminBriefingsPage.test.tsx`
- `tests/components/AdminBriefingDetailPage.test.tsx`
- `tests/components/AdminStatusForm.test.tsx`
- `tests/components/ProposalManager.test.tsx`
- `tests/components/AdminOrdersPage.test.tsx`
- `tests/components/AdminOrderDetailPage.test.tsx`
- `tests/components/OrderAdminActions.test.tsx`
- `tests/components/AdminDashboardPage.test.tsx`
- `tests/components/AdminUsersPage.test.tsx`
- `tests/components/UsersClient.test.tsx`
- `tests/components/AdminContactsPage.test.tsx`

### Indicador consolidado do ciclo

- `npm run test:component` verde com **30 ficheiros** e **57 testes** a passar
- `npm run typecheck` verde

---

## 4. Validação executada

Os seguintes checks foram executados com sucesso no fechamento técnico do M3:

- `npm run test:component`
- `npm run typecheck`

---

## 5. Ajustes feitos durante a validação

| Ajuste | Motivo |
|---|---|
| Refinamento de seletores em páginas admin | evitar falsos negativos por elementos duplicados |
| Ajuste de asserção em comentários resolvidos | alinhar o teste ao comportamento real de ocultar itens resolvidos |
| Ajuste de asserção em `UsersClient` | evitar ambiguidade em labels repetidas após atualização de estado |

---

## 6. Fechamento técnico do ciclo

O M3 deve ser considerado:

- **tecnicamente concluído**
- **pronto para commit, push e deploy após validação manual final do utilizador**
- **apto a transicionar para o M4**

---

## 7. Impacto do M3

### Antes do M3

- frontend crítico com proteção muito parcial
- grande dependência de teste manual em portal e admin
- risco alto de regressão visual e comportamental em formulários e fluxos centrais

### Depois do M3

- portal e admin cobertos na maior parte da superfície crítica
- formulários e ações sensíveis com regressão automatizada
- base de frontend pronta para complementar o M4 com E2E

---

## 8. Próximo passo formal

O próximo passo obrigatório após o fechamento do M3 é:

**executar o M4 com foco em smoke E2E de release nas jornadas principais.**