"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ className }: Readonly<{ className?: string }>) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className={className}
    >
      Sair
    </button>
  );
}
