import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where:  { email: session.user.email },
    select: { name: true, email: true, phone: true, company: true, role: true },
  });
  if (!user) redirect("/portal/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;
  const [briefingCount, orderCount] = await Promise.all([
    prisma.briefing.count({ where: { user: { email: session.user.email } } }),
    db.order.count({ where: { client: { email: session.user.email } } }),
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
