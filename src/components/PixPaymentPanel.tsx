"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface PixPaymentPanelProps {
  orderId: string;
  amountCents: number;
  installmentLabel?: string;
  dueDate?: string | null;
}

const PIX_KEY       = process.env.NEXT_PUBLIC_PIX_KEY ?? "(13) 99614-5903";
const PIX_KEY_RAW   = PIX_KEY.replaceAll(/\D/g, "");   // só dígitos para validação
const PIX_OWNER     = process.env.NEXT_PUBLIC_PIX_OWNER ?? "RICARDO LEANDRO SOUZA DE OLIVEIRA";
const PIX_BANK      = process.env.NEXT_PUBLIC_PIX_BANK  ?? "Santander";

export function PixPaymentPanel({
  orderId,
  amountCents,
  installmentLabel,
  dueDate,
}: Readonly<PixPaymentPanelProps>) {
  const t = useTranslations("portal");

  const [copied,     setCopied]     = useState(false);
  const [notifying,  setNotifying]  = useState(false);
  const [notified,   setNotified]   = useState(false);
  const [notifyErr,  setNotifyErr]  = useState("");

  const amount = (amountCents / 100).toLocaleString("pt-BR", {
    style:    "currency",
    currency: "BRL",
  });

  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;

  function copyKey() {
    void navigator.clipboard.writeText(PIX_KEY_RAW).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function notifyAdmin() {
    setNotifyErr("");
    setNotifying(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pix-notify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amountCents }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setNotifyErr(data.error ?? t("pixNotifyErr"));
        setNotifying(false);
        return;
      }
      setNotified(true);
    } catch {
      setNotifyErr(t("pixNotifyErr"));
    } finally {
      setNotifying(false);
    }
  }

  return (
    <div
      className={`mt-4 rounded-2xl border p-5 space-y-4 ${
        isOverdue
          ? "border-red-500/40 bg-red-500/5"
          : "border-emerald-500/30 bg-emerald-500/5"
      }`}
    >
      {/* Header */}
      <div>
        <h2
          className={`text-sm font-semibold mb-0.5 ${
            isOverdue ? "text-red-300" : "text-emerald-300"
          }`}
        >
          {installmentLabel ?? t("pixTitle")}
        </h2>
        <p className="text-2xl font-bold text-white">{amount}</p>
        {dueDate && (
          <p
            className={`text-xs mt-1 ${
              isOverdue ? "text-red-400 font-semibold" : "text-slate-400"
            }`}
          >
            {isOverdue ? t("payDueDateOverdue") : t("payDueDate")}{" "}
            {new Date(dueDate).toLocaleDateString("pt-BR", {
              day:   "2-digit",
              month: "long",
              year:  "numeric",
            })}
          </p>
        )}
      </div>

      {/* QR Code + dados */}
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* QR code estático */}
        <div className="rounded-xl border border-white/10 bg-white p-2 shrink-0">
          <Image
            src="/images/pix-qrcode.png"
            alt={t("pixQrCodeAlt")}
            width={140}
            height={140}
            className="rounded"
            priority
          />
        </div>

        {/* Dados de pagamento */}
        <div className="flex-1 space-y-2 text-sm">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">{t("pixKeyLabel")}</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm select-all">
                {PIX_KEY}
              </span>
              <button
                onClick={copyKey}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
              >
                {copied ? t("pixCopied") : t("pixCopy")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">{t("pixOwnerLabel")}</p>
              <p className="text-xs text-white">{PIX_OWNER}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">{t("pixBankLabel")}</p>
              <p className="text-xs text-white">{PIX_BANK}</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 pt-1">{t("pixInstructions")}</p>
        </div>
      </div>

      {/* Botão / confirmação */}
      {notified ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          ✓ {t("pixNotifyConfirm")}
        </div>
      ) : (
        <div className="space-y-2">
          {notifyErr && (
            <p className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400">{notifyErr}</p>
          )}
          <button
            onClick={() => { void notifyAdmin(); }}
            disabled={notifying}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {notifying ? t("pixNotifyLoading") : t("pixNotifyBtn")}
          </button>
        </div>
      )}
    </div>
  );
}
