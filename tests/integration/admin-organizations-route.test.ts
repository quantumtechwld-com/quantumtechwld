import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  orgFindMany: vi.fn(),
  orgFindUnique: vi.fn(),
  orgCreate: vi.fn(),
  orgUpdate: vi.fn(),
  memberUpsert: vi.fn(),
  memberUpdate: vi.fn(),
  memberDelete: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  userUpdateMany: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organization: {
      findMany: mocks.orgFindMany,
      findUnique: mocks.orgFindUnique,
      create: mocks.orgCreate,
      update: mocks.orgUpdate,
    },
    organizationMember: {
      upsert: mocks.memberUpsert,
      update: mocks.memberUpdate,
      delete: mocks.memberDelete,
    },
    user: {
      findUnique: mocks.userFindUnique,
      update: mocks.userUpdate,
      updateMany: mocks.userUpdateMany,
    },
  },
}));

import { GET as getOrgs, POST as createOrg } from "@/app/api/admin/organizations/route";
import { GET as getOrgById, PATCH as patchOrg } from "@/app/api/admin/organizations/[id]/route";
import {
  POST as addMember,
  PATCH as updateMemberRole,
  DELETE as removeMember,
} from "@/app/api/admin/organizations/[id]/members/route";

const orgParams = { params: Promise.resolve({ id: "org_1" }) };

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const adminSession = { user: { id: "admin_1", email: "admin@example.com", role: "ADMIN" } };
const clientSession = { user: { id: "user_1", email: "client@example.com", role: "CLIENT" } };

const fakeOrg = {
  id: "org_1",
  name: "Acme Corp",
  slug: "acme-corp",
  plan: "FREE",
  status: "ACTIVE",
  logo: null,
  createdAt: new Date(),
  _count: { members: 2, orders: 5 },
};

const fakeMember = { organizationId: "org_1", userId: "user_1", role: "MEMBER" };

// ─── /api/admin/organizations ──────────────────────────────────────────────────

describe("GET /api/admin/organizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue(adminSession);
    mocks.orgFindMany.mockResolvedValue([fakeOrg]);
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue(clientSession);

    const response = await getOrgs();
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Não autorizado.");
  });

  it("retorna 403 quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await getOrgs();

    expect(response.status).toBe(403);
  });

  it("lista organizacoes para admin autenticado", async () => {
    const response = await getOrgs();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.organizations).toHaveLength(1);
    expect(body.organizations[0].id).toBe("org_1");
  });
});

describe("POST /api/admin/organizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue(adminSession);
    mocks.orgFindUnique.mockResolvedValue(null); // slug livre
    mocks.orgCreate.mockResolvedValue(fakeOrg);
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue(clientSession);

    const req = new NextRequest("http://localhost/api/admin/organizations", {
      method: "POST",
      body: JSON.stringify({ name: "Acme Corp", slug: "acme-corp" }),
      headers: { "content-type": "application/json" },
    });
    const response = await createOrg(req);
    expect(response.status).toBe(403);
  });

  it("retorna 422 quando dados invalidos (name muito curto)", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations", {
      method: "POST",
      body: JSON.stringify({ name: "A", slug: "acme-corp" }),
      headers: { "content-type": "application/json" },
    });
    const response = await createOrg(req);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Dados inválidos.");
  });

  it("retorna 422 quando slug tem caracteres invalidos", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations", {
      method: "POST",
      body: JSON.stringify({ name: "Acme Corp", slug: "Acme Corp" }),
      headers: { "content-type": "application/json" },
    });
    const response = await createOrg(req);
    expect(response.status).toBe(422);
  });

  it("retorna 409 quando slug ja esta em uso", async () => {
    mocks.orgFindUnique.mockResolvedValue({ id: "org_other" });

    const req = new NextRequest("http://localhost/api/admin/organizations", {
      method: "POST",
      body: JSON.stringify({ name: "Acme Corp", slug: "acme-corp" }),
      headers: { "content-type": "application/json" },
    });
    const response = await createOrg(req);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe("Slug já em uso.");
  });

  it("cria org com sucesso e retorna 201", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations", {
      method: "POST",
      body: JSON.stringify({ name: "Acme Corp", slug: "acme-corp", plan: "PRO" }),
      headers: { "content-type": "application/json" },
    });
    const response = await createOrg(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.organization.id).toBe("org_1");
    expect(mocks.orgCreate).toHaveBeenCalledTimes(1);
  });
});

// ─── /api/admin/organizations/[id] ────────────────────────────────────────────

describe("GET /api/admin/organizations/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue(adminSession);
    mocks.orgFindUnique.mockResolvedValue({ ...fakeOrg, members: [], _count: { orders: 0 } });
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue(clientSession);
    const response = await getOrgById(new NextRequest("http://localhost/api/admin/organizations/org_1"), orgParams);
    expect(response.status).toBe(403);
  });

  it("retorna 404 quando org nao existe", async () => {
    mocks.orgFindUnique.mockResolvedValue(null);
    const response = await getOrgById(new NextRequest("http://localhost/api/admin/organizations/org_1"), orgParams);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Organização não encontrada.");
  });

  it("retorna org com membros para admin", async () => {
    const response = await getOrgById(new NextRequest("http://localhost/api/admin/organizations/org_1"), orgParams);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.organization.id).toBe("org_1");
  });
});

describe("PATCH /api/admin/organizations/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue(adminSession);
    mocks.orgUpdate.mockResolvedValue({ ...fakeOrg, name: "Acme Corp Updated" });
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue(clientSession);
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Nova Nome" }),
      headers: { "content-type": "application/json" },
    });
    const response = await patchOrg(req, orgParams);
    expect(response.status).toBe(403);
  });

  it("retorna 422 com dados invalidos", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1", {
      method: "PATCH",
      body: JSON.stringify({ plan: "INVALID_PLAN" }),
      headers: { "content-type": "application/json" },
    });
    const response = await patchOrg(req, orgParams);
    expect(response.status).toBe(422);
  });

  it("atualiza org com sucesso", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Acme Corp Updated", status: "SUSPENDED" }),
      headers: { "content-type": "application/json" },
    });
    const response = await patchOrg(req, orgParams);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.organization.name).toBe("Acme Corp Updated");
    expect(mocks.orgUpdate).toHaveBeenCalledTimes(1);
  });
});

// ─── /api/admin/organizations/[id]/members ────────────────────────────────────

describe("POST /api/admin/organizations/[id]/members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue(adminSession);
    mocks.orgFindUnique.mockResolvedValue({ id: "org_1" });
    mocks.userFindUnique.mockResolvedValue({ id: "user_1" });
    mocks.memberUpsert.mockResolvedValue(fakeMember);
    mocks.userUpdate.mockResolvedValue({});
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue(clientSession);
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members", {
      method: "POST",
      body: JSON.stringify({ userId: "user_1" }),
      headers: { "content-type": "application/json" },
    });
    const response = await addMember(req, orgParams);
    expect(response.status).toBe(403);
  });

  it("retorna 404 quando org nao existe", async () => {
    mocks.orgFindUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members", {
      method: "POST",
      body: JSON.stringify({ userId: "user_1" }),
      headers: { "content-type": "application/json" },
    });
    const response = await addMember(req, orgParams);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Organização não encontrada.");
  });

  it("retorna 404 quando utilizador nao existe", async () => {
    mocks.userFindUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members", {
      method: "POST",
      body: JSON.stringify({ userId: "user_nao_existe" }),
      headers: { "content-type": "application/json" },
    });
    const response = await addMember(req, orgParams);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Utilizador não encontrado.");
  });

  it("retorna 422 quando userId esta ausente", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });
    const response = await addMember(req, orgParams);
    expect(response.status).toBe(422);
  });

  it("adiciona membro com role MEMBER por defeito e sincroniza organizationId", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members", {
      method: "POST",
      body: JSON.stringify({ userId: "user_1" }),
      headers: { "content-type": "application/json" },
    });
    const response = await addMember(req, orgParams);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.member.role).toBe("MEMBER");
    expect(mocks.userUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "user_1" },
      data: { organizationId: "org_1" },
    }));
  });

  it("aceita role ADMIN no body", async () => {
    mocks.memberUpsert.mockResolvedValue({ ...fakeMember, role: "ADMIN" });

    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members", {
      method: "POST",
      body: JSON.stringify({ userId: "user_1", role: "ADMIN" }),
      headers: { "content-type": "application/json" },
    });
    const response = await addMember(req, orgParams);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.member.role).toBe("ADMIN");
  });
});

describe("PATCH /api/admin/organizations/[id]/members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue(adminSession);
    mocks.memberUpdate.mockResolvedValue({ ...fakeMember, role: "ADMIN" });
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue(clientSession);
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members", {
      method: "PATCH",
      body: JSON.stringify({ userId: "user_1", role: "ADMIN" }),
      headers: { "content-type": "application/json" },
    });
    const response = await updateMemberRole(req, orgParams);
    expect(response.status).toBe(403);
  });

  it("retorna 422 quando role e invalida", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members", {
      method: "PATCH",
      body: JSON.stringify({ userId: "user_1", role: "OWNER" }),
      headers: { "content-type": "application/json" },
    });
    const response = await updateMemberRole(req, orgParams);
    expect(response.status).toBe(422);
  });

  it("atualiza role do membro com sucesso", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members", {
      method: "PATCH",
      body: JSON.stringify({ userId: "user_1", role: "ADMIN" }),
      headers: { "content-type": "application/json" },
    });
    const response = await updateMemberRole(req, orgParams);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.member.role).toBe("ADMIN");
    expect(mocks.memberUpdate).toHaveBeenCalledTimes(1);
  });
});

describe("DELETE /api/admin/organizations/[id]/members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue(adminSession);
    mocks.memberDelete.mockResolvedValue({});
    mocks.userUpdateMany.mockResolvedValue({});
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue(clientSession);
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members?userId=user_1");
    const response = await removeMember(req, orgParams);
    expect(response.status).toBe(403);
  });

  it("retorna 400 quando userId nao e passado como query param", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members");
    const response = await removeMember(req, orgParams);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("userId obrigatório.");
  });

  it("remove membro e limpa organizationId do user com sucesso", async () => {
    const req = new NextRequest("http://localhost/api/admin/organizations/org_1/members?userId=user_1");
    const response = await removeMember(req, orgParams);

    expect(response.status).toBe(200);
    expect(mocks.memberDelete).toHaveBeenCalledTimes(1);
    expect(mocks.userUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "user_1", organizationId: "org_1" },
      data: { organizationId: null },
    }));
  });
});
