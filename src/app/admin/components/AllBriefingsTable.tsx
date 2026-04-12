import Link from "next/link";

type Briefing = {
  id: string;
  user: { name: string | null; email: string | null };
  projectType: string;
  status: string;
  createdAt: Date;
};

type AllBriefingsTableProps = Readonly<{
  briefings: Briefing[];
  PROJECT_LABEL: Record<string, string>;
  STATUS_LABEL: Record<string, string>;
  STATUS_COLOR: Record<string, string>;
  scopeSet: Set<string>;
}>;

export default function AllBriefingsTable({ briefings, PROJECT_LABEL, STATUS_LABEL, STATUS_COLOR, scopeSet }: AllBriefingsTableProps) {
  if (briefings.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-white/40">
        Ainda não há briefings submetidos.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
            <th className="px-6 py-3 text-left">Cliente</th>
            <th className="px-6 py-3 text-left">Projecto</th>
            <th className="px-6 py-3 text-left">Estado</th>
            <th className="px-6 py-3 text-left">Escopo</th>
            <th className="px-6 py-3 text-left">Data</th>
            <th className="px-6 py-3 text-left"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {briefings.map((b) => (
            <tr key={b.id} className="hover:bg-white/2 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <p className="text-white font-medium">{b.user.name ?? "—"}</p>
                  <p className="text-white/40 text-xs">{b.user.email}</p>
                </div>
              </td>
              <td className="px-6 py-4 text-white/70">
                {PROJECT_LABEL?.[b.projectType] ?? b.projectType}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[b.status]}`}>
                  {STATUS_LABEL[b.status]}
                </span>
              </td>
              <td className="px-6 py-4">
                {scopeSet.has(b.id) ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{" "}
                    Gerado
                  </span>
                ) : (
                  <span className="text-white/30 text-xs">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-white/40 text-xs whitespace-nowrap">
                {new Date(b.createdAt).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/admin/briefing/${b.id}`}
                  className="text-accent hover:text-accent-light text-xs font-medium transition-colors"
                >
                  Ver detalhes →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
