"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/portal/actions/set-locale";

const LOCALES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
] as const;

interface Props {
  currentLocale: string;
}

export default function PortalLocaleSwitcher({ currentLocale }: Readonly<Props>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(code: string) {
    if (code === currentLocale) return;
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 px-3 pb-1">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          disabled={isPending}
          onClick={() => handleChange(code)}
          className={`rounded px-2.5 py-1 text-xs font-bold transition-colors disabled:opacity-40 ${
            currentLocale === code
              ? "bg-accent/20 text-accent-light ring-1 ring-accent/30"
              : "text-white/35 hover:bg-white/8 hover:text-white/70"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
