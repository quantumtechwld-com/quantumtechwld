import PortalShell from "@/components/portal/PortalShell";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PortalShell>{children}</PortalShell>;
}
