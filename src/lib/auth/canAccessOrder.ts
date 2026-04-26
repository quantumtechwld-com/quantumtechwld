import "server-only";

/**
 * ESCOPO DE SEGURANÇA — LEIA ANTES DE MODIFICAR
 *
 * Organizações são entidades CLIENTE. Um usuário com organizationId é um cliente
 * que pertence a uma empresa. Isso NÃO concede nenhum acesso ao painel admin do sistema.
 *
 * Hierarquia de acesso:
 *   ADMIN (plataforma) → acesso total ao sistema
 *   CLIENT (com org)   → acesso ao portal cliente da sua organização apenas
 *   CLIENT (sem org)   → acesso ao portal cliente individual apenas
 *
 * orgRole (ADMIN | MEMBER) controla permissões DENTRO da organização
 * no portal cliente — nunca no sistema admin.
 *
 * Enforcement de orgRole previsto para etapa futura:
 * @see docs/ORGANIZATION-FEATURE-PLAN.md — seção "Etapa Futura: Enforcement de Roles"
 */

type OrderForAuth = {
  client?: { email?: string | null } | null;
  organizationId?: string | null;
};

type SessionUser = {
  email?: string | null;
  role?: string | null;
  organizationId?: string | null;
};

/**
 * Única fonte de verdade para autorização de acesso a pedidos.
 *
 * Retorna `true` se o utilizador pode ver/interagir com o pedido:
 * - Admin da plataforma → sempre pode
 * - Dono direto do pedido (clientId = user) → pode
 * - Membro da organização dona do pedido → pode (Opção C)
 */
export function canAccessOrder(order: OrderForAuth, user: SessionUser): boolean {
  // Platform admin — acesso total
  if (user.role === "ADMIN") return true;

  // Dono direto do pedido (retrocompatível — comportamento original)
  if (order.client?.email && order.client.email === user.email) return true;

  // Membro da mesma organização (Opção C — todos da empresa veem os pedidos da empresa)
  if (order.organizationId && order.organizationId === user.organizationId) return true;

  return false;
}
