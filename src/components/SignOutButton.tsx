"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ className, label = "Sair" }: Readonly<{ className?: string; label?: string }>) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className={className}
    >
      {label}
    </button>
  );
}
