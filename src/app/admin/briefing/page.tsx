import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AllBriefingsTable from "@/app/admin/components/AllBriefingsTable";
import {
  BRIEFING_STATUS_LABEL as STATUS_LABEL,
  BRIEFING_STATUS_COLOR as STATUS_COLOR,
  PROJECT_TYPE_LABEL as PROJECT_LABEL,
} from "@/lib/constants";

export const metadata = { title: "Briefings" };

export default async function AdminBriefingsPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/portal");
  }

  const briefings = await prisma.briefing.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scopes = await (prisma as any).scope.findMany({
    select: { briefingId: true },
  }) as { briefingId: string }[];

  const scopeSet = new Set(scopes.map((s) => s.briefingId));

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent-light mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-white">Briefings</h1>
          <p className="text-white/40 text-sm mt-1">{briefings.length} briefing(s) submetido(s)</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
          <AllBriefingsTable
            briefings={briefings}
            PROJECT_LABEL={PROJECT_LABEL}
            STATUS_LABEL={STATUS_LABEL}
            STATUS_COLOR={STATUS_COLOR}
            scopeSet={scopeSet}
          />
        </div>
    </main>
  );
}
