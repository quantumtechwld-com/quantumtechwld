import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "./ProfileForm";

const ORG_ROLE_CONFIG: Record<string, { className: string }> = {
  ADMIN:  { className: "bg-blue-500/20 text-blue-300" },
  MEMBER: { className: "bg-slate-600/40 text-slate-400" },
};

function OrgRoleBadge({ role, label }: Readonly<{ role: string; label: string }>) {
  const config = ORG_ROLE_CONFIG[role] ?? ORG_ROLE_CONFIG.MEMBER;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}>
      {label}
    </span>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where:  { email: session.user.email },
    select: { name: true, email: true, phone: true, company: true, role: true, organizationId: true },
  });
  if (!user) redirect("/portal/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;
  const orgId = user.organizationId ?? session.user.organizationId ?? null;
  const [briefingCount, orderCount, org] = await Promise.all([
    prisma.briefing.count({ where: { user: { email: session.user.email } } }),
    db.order.count({ where: { client: { email: session.user.email } } }),
    orgId
      ? db.organization.findUnique({ where: { id: orgId }, select: { id: true, name: true } })
      : Promise.resolve(null),
  ]);

  const t = await getTranslations("portal");

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-8">
        <Link href="/portal" className="text-sm text-accent hover:text-accent-light transition-colors">
          {t("profileBack")}
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-white">{t("profileTitle")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("profileSubtitle")}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-white">{briefingCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">{t("profileStatsBriefings")}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-white">{orderCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">{t("profileStatsOrders")}</p>
        </div>
      </div>

      {org && (
        <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
              {org.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-slate-400">{t("profileOrgLabel")}</p>
              <p className="text-sm font-semibold text-white">{org.name}</p>
            </div>
          </div>
          {session.user.orgRole && (
            <OrgRoleBadge
              role={session.user.orgRole}
              label={session.user.orgRole === "ADMIN" ? t("orgRoleAdmin") : t("orgRoleMember")}
            />
          )}
        </div>
      )}

      <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
        <ProfileForm
          user={{
            name:    user.name,
            email:   user.email,
            phone:   user.phone,
            company: user.company,
          }}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/3 p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-1">{t("profileSessionTitle")}</h2>
        <p className="text-xs text-slate-500 mb-3">{t("profileSessionDesc")}</p>
        <Link
          href="/api/auth/signout"
          className="inline-flex rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
        >
          {t("profileSignOut")}
        </Link>
      </div>
    </main>
  );
}
