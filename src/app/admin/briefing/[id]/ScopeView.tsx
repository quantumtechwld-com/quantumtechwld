import ScopePanel from "@/components/scope/ScopePanel";
import type { GeneratedScope } from "@/app/api/briefing/scope/route";

type Props = Readonly<{
  briefingId: string;
  initialScope: GeneratedScope | null;
}>;

export default function ScopeView({ briefingId, initialScope }: Props) {
  return <ScopePanel briefingId={briefingId} initialScope={initialScope} variant="admin" />;
}
