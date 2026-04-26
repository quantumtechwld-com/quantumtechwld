import { describe, it, expect } from "vitest";
import { canAccessOrder } from "@/lib/auth/canAccessOrder";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const adminUser = { email: "admin@example.com", role: "ADMIN", organizationId: null };
const directOwner = { email: "owner@example.com", role: "CLIENT", organizationId: null };
const orgMember = { email: "member@company.com", role: "CLIENT", organizationId: "org_1" };
const otherOrgMember = { email: "other@rival.com", role: "CLIENT", organizationId: "org_2" };
const standaloneClient = { email: "solo@example.com", role: "CLIENT", organizationId: null };

const orderOwnedDirectly = {
  client: { email: "owner@example.com" },
  organizationId: null,
};

const orderOwnedByOrg = {
  client: { email: "another@company.com" },
  organizationId: "org_1",
};

const orderOwnedByOrgAndDirectly = {
  client: { email: "member@company.com" },
  organizationId: "org_1",
};

const orderNoOwner = {
  client: null,
  organizationId: null,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("canAccessOrder", () => {
  // ── Platform admin ───────────────────────────────────────────────────────
  describe("utilizador admin da plataforma", () => {
    it("tem acesso a qualquer pedido com client direto", () => {
      expect(canAccessOrder(orderOwnedDirectly, adminUser)).toBe(true);
    });

    it("tem acesso a qualquer pedido de organização", () => {
      expect(canAccessOrder(orderOwnedByOrg, adminUser)).toBe(true);
    });

    it("tem acesso a pedido sem client e sem org", () => {
      expect(canAccessOrder(orderNoOwner, adminUser)).toBe(true);
    });
  });

  // ── Direct owner ─────────────────────────────────────────────────────────
  describe("dono direto do pedido", () => {
    it("tem acesso quando o email bate com o client", () => {
      expect(canAccessOrder(orderOwnedDirectly, directOwner)).toBe(true);
    });

    it("nao tem acesso quando o email nao bate", () => {
      expect(canAccessOrder(orderOwnedDirectly, standaloneClient)).toBe(false);
    });

    it("nao tem acesso a pedido de outra org sem match de email", () => {
      expect(canAccessOrder(orderOwnedByOrg, directOwner)).toBe(false);
    });
  });

  // ── Org member ───────────────────────────────────────────────────────────
  describe("membro de organização", () => {
    it("tem acesso a pedido da sua org mesmo sem ser o client direto", () => {
      expect(canAccessOrder(orderOwnedByOrg, orgMember)).toBe(true);
    });

    it("tem acesso quando é tanto membro da org quanto client direto", () => {
      expect(canAccessOrder(orderOwnedByOrgAndDirectly, orgMember)).toBe(true);
    });

    it("nao tem acesso a pedido de outra organização", () => {
      expect(canAccessOrder(orderOwnedByOrg, otherOrgMember)).toBe(false);
    });

    it("nao tem acesso a pedido individual sem match de email", () => {
      expect(canAccessOrder(orderOwnedDirectly, orgMember)).toBe(false);
    });
  });

  // ── Edge cases ───────────────────────────────────────────────────────────
  describe("casos extremos", () => {
    it("retorna false para client sem sessao (null email)", () => {
      expect(canAccessOrder(orderOwnedDirectly, { email: null, role: "CLIENT", organizationId: null })).toBe(false);
    });

    it("retorna false para pedido sem client e sem org para utilizador nao admin", () => {
      expect(canAccessOrder(orderNoOwner, standaloneClient)).toBe(false);
    });

    it("retorna false quando org do pedido é null mas utilizador tem org", () => {
      const orderWithNullOrg = { client: { email: "x@x.com" }, organizationId: null };
      expect(canAccessOrder(orderWithNullOrg, orgMember)).toBe(false);
    });
  });
});
