import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import LogoAnimated from "@/components/home/LogoAnimated";

export default function AdminHeader() {
  return (
    <header className="border-b border-white/5 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center">
            <LogoAnimated size={32} />
          </div>
          <span className="font-semibold text-white">Admin Panel</span>
          <span className="text-white/30 text-sm">Quantum Technology</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            Utilizadores
          </Link>
          <Link
            href="/admin/orders"
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            Pedidos
          </Link>
          <SignOutButton className="text-sm text-white/40 hover:text-red-400 transition-colors" />
        </div>
      </div>
    </header>
  );
}
