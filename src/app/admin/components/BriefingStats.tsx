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
        { label: "Total de Briefings", value: counts.total, color: "from-accent to-accent-light" },
        { label: "Novos Recebidos", value: counts.received, color: "from-accent to-accent-light" },
        { label: "Em Desenvolvimento", value: counts.inProgress, color: "from-accent to-accent-light" },
        { label: "Entregues", value: counts.delivered, color: "from-accent to-accent-light" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-white/8 bg-white/3 p-3"
        >
          <p className="text-xs text-white/50 mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
