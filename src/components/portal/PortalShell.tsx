import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PortalSidebar from "@/components/portal/PortalSidebar";

interface Props {
  children: React.ReactNode;
}

export default async function PortalShell({ children }: Readonly<Props>) {
  const session = await auth();
  const email = session?.user?.email ?? "";

  let userName: string | null = null;
  let userImage: string | null = null;
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, image: true },
    });
    userName  = user?.name  ?? null;
    userImage = user?.image ?? null;
  }

  const initial = (userName ?? email).charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background text-white">
      <PortalSidebar
        userName={userName}
        userEmail={email}
        userInitial={initial}
        userImage={userImage}
      />
      <main className="px-4 pb-16 pt-6 md:px-6">
        {children}
      </main>
    </div>
  );
}
