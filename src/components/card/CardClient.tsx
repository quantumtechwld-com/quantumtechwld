"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations, useLocale } from "next-intl";
import {
  MessageCircle,
  Mail,
  ExternalLink,
  Globe,
  Download,
  Share2,
  Check,
  RotateCcw,
} from "lucide-react";
import InstallPrompt from "./InstallPrompt";

// ── Contatos (centralizar aqui para alterar facilmente) ────────────────────
const CONTACT = {
  name: "QuantumTech",
  role: "Software Development Agency",
  email: "rleandro@quantumtechwld.com",
  whatsapp: "https://wa.me/351912091197",
  linkedin: "https://www.linkedin.com/company/quantumtech-software-agency",
  instagram: "https://www.instagram.com/quantumscale.dev/",
  website: "https://quantumtechwld.com",
  cardUrl: "https://quantumtechwld.com/card",
} as const;

// ── Gera e baixa um arquivo .vcf (vCard 4.0) ──────────────────────────────
function downloadVCard() {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:4.0",
    `FN:${CONTACT.name}`,
    `ORG:${CONTACT.name}`,
    `TITLE:${CONTACT.role}`,
    `EMAIL;TYPE=WORK:${CONTACT.email}`,
    `URL:${CONTACT.website}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${CONTACT.linkedin}`,
    `NOTE:${CONTACT.cardUrl}`,
    "END:VCARD",
  ].join("\r\n");

  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quantumtech.vcf";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Tipo dos links de ação ────────────────────────────────────────────────
type ActionLink = {
  key: "whatsapp" | "email" | "linkedin" | "instagram" | "website";
  href: string;
  icon: React.ReactNode;
  colorClass: string;
};

// ── Componente principal ───────────────────────────────────────────────────
export default function CardClient() {
  const t = useTranslations("card");
  const locale = useLocale();
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  // URL localizada — direciona para o idioma atual do visitante
  const localizedWebsite = `https://quantumtechwld.com/${locale}`;

  const ACTION_LINKS: ActionLink[] = [
    {
      key: "whatsapp",
      href: CONTACT.whatsapp,
      icon: <MessageCircle size={20} />,
      colorClass: "hover:border-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-400/10",
    },
    {
      key: "email",
      href: `mailto:${CONTACT.email}`,
      icon: <Mail size={20} />,
      colorClass: "hover:border-accent/60 hover:text-accent hover:bg-accent/10",
    },
    {
      key: "linkedin",
      href: CONTACT.linkedin,
      icon: <ExternalLink size={20} />,
      colorClass: "hover:border-blue-400/60 hover:text-blue-400 hover:bg-blue-400/10",
    },
    {
      key: "instagram",
      href: CONTACT.instagram,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      colorClass: "hover:border-pink-500/60 hover:text-pink-500 hover:bg-pink-500/10",
    },
    {
      key: "website",
      href: localizedWebsite,
      icon: <Globe size={20} />,
      colorClass: "hover:border-cyan-tech/60 hover:text-cyan-tech hover:bg-cyan-tech/10",
    },
  ];

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: CONTACT.name,
          text: t("tagline"),
          url: CONTACT.cardUrl,
        });
      } catch {
        // Usuário cancelou o share — não é erro
      }
    } else {
      await (navigator as Navigator).clipboard.writeText(CONTACT.cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [t]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[--background] px-4 py-8">
      {/* ── Partículas de fundo ────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/8 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-tech/5 blur-[80px]" />
      </div>

      {/* ── Área de flip ──────────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-sm"
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative h-115 w-full transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ────────── FRENTE ────────── */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl border border-accent/20 bg-bg-card/80 p-6 shadow-[0_0_40px_rgba(155,89,255,0.12)] backdrop-blur-xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Glow interno */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-accent/8 via-transparent to-cyan-tech/5"
            />

            {/* Borda superior colorida */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-accent/60 to-transparent"
            />

            <div className="relative flex h-full flex-col justify-between">
              {/* Logo + nome */}
              <div className="flex flex-col items-center gap-4 pt-2">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 shadow-[0_0_24px_rgba(155,89,255,0.25)]">
                  <Image
                    src="/images/logo/logo-symbol.svg"
                    alt="QuantumTech logo"
                    width={52}
                    height={52}
                    priority
                  />
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    QuantumTech
                  </h1>
                  <p className="mt-1 text-sm font-medium text-accent-light">
                    {t("role")}
                  </p>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-center text-sm leading-relaxed text-white/50">
                {t("tagline")}
              </p>

              {/* Links de ação */}
              <div className="grid grid-cols-5 gap-2">
                {ACTION_LINKS.map(({ key, href, icon, colorClass }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t(key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border border-white/8 bg-white/4 px-2 py-3 text-white/50 transition-all duration-200 ${colorClass}`}
                  >
                    {icon}
                    <span className="text-[10px] font-medium leading-none">
                      {t(key)}
                    </span>
                  </a>
                ))}
              </div>

              {/* Botão de flip */}
              <button
                type="button"
                onClick={() => setFlipped(true)}
                className="w-full text-center text-[11px] text-white/25 transition-colors hover:text-white/50"
              >
                {t("flipHint")}
              </button>
            </div>
          </div>

          {/* ────────── VERSO ────────── */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl border border-accent/20 bg-bg-card/80 p-6 shadow-[0_0_40px_rgba(155,89,255,0.12)] backdrop-blur-xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-cyan-tech/5 via-transparent to-accent/8"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-cyan-tech/40 to-transparent"
            />

            <div className="relative flex h-full flex-col items-center justify-between">
              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-medium text-white/60">
                  {t("qrLabel")}
                </p>
                <div className="rounded-xl border border-white/10 bg-white p-3 shadow-[0_0_20px_rgba(155,89,255,0.2)]">
                  <QRCodeSVG
                    value={CONTACT.cardUrl}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#050816"
                    level="M"
                  />
                </div>
                <p className="text-xs text-white/30">{CONTACT.cardUrl}</p>
              </div>

              {/* Ações */}
              <div className="flex w-full flex-col gap-2">
                <button
                  type="button"
                  onClick={() => downloadVCard()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 py-3 text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent/20 hover:shadow-[0_0_16px_rgba(155,89,255,0.3)]"
                >
                  <Download size={16} />
                  {t("saveContact")}
                </button>

                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-emerald-400" />
                      <span className="text-emerald-400">{t("copied")}</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={16} />
                      {t("share")}
                    </>
                  )}
                </button>
              </div>

              {/* Dica de voltar */}
              <button
                type="button"
                onClick={() => setFlipped(false)}
                className="flex items-center gap-1 text-[11px] text-white/25 transition-colors hover:text-white/50"
              >
                <RotateCcw size={11} />
                {t("flipBack")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rodapé ────────────────────────────────────────────────────────── */}
      <p className="mt-8 text-center text-xs text-white/20">
        quantumtechwld.com
      </p>

      {/* ── Prompt de instalação PWA ──────────────────────────────────────── */}
      <InstallPrompt />
    </div>
  );
}
