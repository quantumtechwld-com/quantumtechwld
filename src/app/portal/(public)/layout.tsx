export default function PublicPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-white">
      {children}
    </div>
  );
}
