"use client";

import { useEffect, useState } from "react";
import { Download, Share, X, ChevronUp } from "lucide-react";

// Tipagem da API BeforeInstallPrompt (não está no lib.dom.d.ts padrão)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  if (globalThis.window === undefined) return false;
  return (
    globalThis.window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in globalThis.navigator &&
      (globalThis.navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSSheet, setShowIOSSheet] = useState(false);
  const [installed, setInstalled] = useState(() => isInStandaloneMode());

  useEffect(() => {
    // Já instalado como PWA — não mostrar nada
    if (isInStandaloneMode()) return;

    // Já dispensado anteriormente
    if (localStorage.getItem("pwa-dismissed")) return;

    if (isIOS()) {
      // iOS: mostra bottom sheet após 2s
      const t = setTimeout(() => setShowIOSSheet(true), 2000);
      return () => clearTimeout(t);
    }

    // Android/Chrome: intercepta o evento de instalação
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    globalThis.window.addEventListener("beforeinstallprompt", handler);
    return () => globalThis.window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem("pwa-dismissed", "1");
    setDeferredPrompt(null);
    setShowIOSSheet(false);
  };

  // Já instalado ou nada a mostrar
  if (installed || (!deferredPrompt && !showIOSSheet)) return null;

  // ── Android: botão flutuante de 1 clique ────────────────────────────────
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-bg-card/95 px-4 py-3 shadow-[0_0_32px_rgba(155,89,255,0.25)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo/logo-192.png"
            alt="QuantumTech"
            className="h-10 w-10 rounded-xl"
          />
          <div>
            <p className="text-sm font-semibold text-white">Salvar como app</p>
            <p className="text-xs text-white/40">Acesso rápido na tela inicial</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleInstall()}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-white shadow-[0_0_12px_rgba(155,89,255,0.4)] transition-all hover:bg-accent-light"
          >
            <Download size={13} />
            Instalar
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-white/30 transition-colors hover:text-white/60"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── iOS Safari: bottom sheet com guia visual ─────────────────────────────
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/10 bg-bg-card/98 px-6 pb-8 pt-5 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {/* Handle */}
      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="font-semibold text-white">Adicionar à tela inicial</p>
          <p className="mt-0.5 text-xs text-white/40">
            Acesse o cartão como um app, com 1 toque
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar"
          className="rounded-lg p-1.5 text-white/30 transition-colors hover:text-white/60"
        >
          <X size={18} />
        </button>
      </div>

      {/* Passos visuais */}
      <div className="flex flex-col gap-3">
        <Step
          number={1}
          icon={<Share size={16} />}
          text='Toque no ícone de compartilhar'
          sub='Barra inferior do Safari'
        />
        <Step
          number={2}
          icon={<ChevronUp size={16} />}
          text='"Adicionar à Tela de Início"'
          sub="Role a lista de opções para baixo"
        />
        <Step
          number={3}
          icon={<Download size={16} />}
          text="Toque em Adicionar"
          sub="O ícone aparece na sua tela inicial"
        />
      </div>
    </div>
  );
}

function Step({
  number,
  icon,
  text,
  sub,
}: Readonly<{
  number: number;
  icon: React.ReactNode;
  text: string;
  sub: string;
}>) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{text}</p>
        <p className="text-[11px] text-white/35">{sub}</p>
      </div>
      <span className="text-[10px] font-bold text-white/20">{number}/3</span>
    </div>
  );
}
