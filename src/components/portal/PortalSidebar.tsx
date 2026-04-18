"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import LogoAnimated from "@/components/home/LogoAnimated";
import LogoTextAnimated from "@/components/home/LogoTextAnimated";
import {
  User,
  FileText,
  ShoppingBag,
  BookOpen,
  BookMarked,
  X,
  Menu,
  ChevronRight,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; description: string; exact?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/portal/profile",    label: "Perfil",     icon: User,       description: "Dados da conta"          },
  { href: "/portal",            label: "Briefing",   icon: FileText,   description: "Projectos & briefings", exact: true },
  { href: "/portal/orders",     label: "Pedidos",    icon: ShoppingBag,description: "Acompanhar pedidos"     },
  { href: "/portal/biblioteca", label: "Biblioteca", icon: BookOpen,   description: "Recursos & ficheiros"   },
  { href: "/portal/guide",      label: "Guia",       icon: BookMarked, description: "Como funciona"          },
];

interface Props {
  userName?:  string | null;
  userEmail?: string | null;
  userInitial?: string;
  userImage?: string | null;
}

export default function PortalSidebar({ userName, userEmail, userInitial = "?", userImage }: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fechar ao navegar — usando ref para evitar setState directo no effect
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    if (pathnameRef.current !== pathname) {
      pathnameRef.current = pathname;
      setTimeout(() => setOpen(false), 0);
    }
  }, [pathname]);

  // Fechar com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [open]);

  // Bloquear scroll do body enquanto aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 bg-background/90 px-4 backdrop-blur-md">
        {/* Hamburger */}
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/8 hover:text-white"
        >
          <Menu size={20} />
        </button>

        {/* Logo centrado: ícone + texto (igual à home pública) */}
        <Link href="/portal" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <LogoAnimated size={28} />
          <LogoTextAnimated />
        </Link>

        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden bg-accent/20 text-xs font-semibold text-accent-light ring-1 ring-accent/30">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt={userName ?? "avatar"} className="h-full w-full object-cover" />
          ) : (
            userInitial
          )}
        </div>
      </header>

      {/* ── Overlay ─────────────────────────────────────────────────── */}
      <div
        ref={overlayRef}
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Drawer ──────────────────────────────────────────────────── */}
      <dialog
        aria-modal="true"
        aria-label="Menu de navegação"
        open={open}
        className={`fixed inset-y-0 left-0 z-50 m-0 flex w-72 flex-col border-0 bg-[#07081a] p-0 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabeçalho do drawer */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden bg-accent/20 text-sm font-semibold text-accent-light ring-1 ring-accent/30">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt={userName ?? "avatar"} className="h-full w-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="min-w-0">
              {userName && (
                <p className="truncate text-sm font-medium text-white">{userName}</p>
              )}
              <p className="truncate text-xs text-white/40">{userEmail}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/8 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Itens de navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
            Portal do cliente
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon, description, exact }) => {
              const active = isActive(href, exact);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                      active
                        ? "bg-accent/15 text-white ring-1 ring-accent/20"
                        : "text-white/55 hover:bg-white/5 hover:text-white/90"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                        active
                          ? "bg-accent/25 text-accent-light"
                          : "bg-white/5 text-white/40 group-hover:bg-white/8 group-hover:text-white/70"
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium">{label}</span>
                      <span className="block text-[11px] text-white/35 truncate">{description}</span>
                    </span>
                    {active && (
                      <ChevronRight size={14} className="text-accent-light/60 shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Rodapé do drawer */}
        <div className="border-t border-white/5 px-3 py-4">
          <SignOutButton
            label="Terminar sessão"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
          />
        </div>
      </dialog>
    </>
  );
}
