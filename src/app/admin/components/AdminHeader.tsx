import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="border-b border-white/5 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
            A
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
        </div>
      </div>
    </header>
  );
}
