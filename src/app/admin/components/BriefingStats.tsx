type BriefingStatsProps = Readonly<{
  counts: {
    total: number;
    received: number;
    inProgress: number;
    delivered: number;
  };
}>;

export default function BriefingStats({ counts }: BriefingStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Total de Briefings", value: counts.total, color: "from-violet-500 to-purple-600" },
        { label: "Novos Recebidos", value: counts.received, color: "from-blue-500 to-cyan-600" },
        { label: "Em Desenvolvimento", value: counts.inProgress, color: "from-amber-500 to-orange-600" },
        { label: "Entregues", value: counts.delivered, color: "from-emerald-500 to-green-600" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-white/8 bg-white/3 p-5"
        >
          <p className="text-sm text-white/50 mb-1">{stat.label}</p>
          <p className={`text-3xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
