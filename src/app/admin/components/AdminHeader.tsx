"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import LogoAnimated from "@/components/home/LogoAnimated";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Wallet,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; exact?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/admin",                   label: "Dashboard",      icon: LayoutDashboard, exact: true },
  { href: "/admin/users",             label: "Utilizadores",   icon: Users            },
  { href: "/admin/orders",            label: "Pedidos",        icon: ShoppingBag      },
  { href: "/admin/briefing",          label: "Briefings",      icon: FileText         },
  { href: "/admin/biblioteca",        label: "Biblioteca",     icon: BookOpen         },
  { href: "/admin/contacts",          label: "Contatos",       icon: MessageSquare    },
  { href: "/admin/financeiro",        label: "Financeiro",     icon: Wallet           },
  { href: "/admin/security-pipeline", label: "Segurança",      icon: ShieldCheck      },
];

export default function AdminHeader() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-400 items-center gap-6 px-5">
        {/* Logo + título */}
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <LogoAnimated size={28} />
          <span className="text-sm font-semibold text-white">Admin</span>
          <span className="hidden text-xs text-white/25 lg:block">Quantum Technology</span>
        </Link>

        {/* Separador */}
        <div className="h-5 w-px shrink-0 bg-white/8" />

        {/* Nav */}
        <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-accent/15 text-white ring-1 ring-accent/20"
                    : "text-white/45 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <Icon size={13} className={active ? "text-accent-light" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <SignOutButton className="shrink-0 text-xs text-white/35 transition hover:text-red-400" />
      </div>
    </header>
  );
}
