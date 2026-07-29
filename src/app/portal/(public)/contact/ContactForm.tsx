"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export function ContactForm() {
  const t = useTranslations("portal");
  const locale = useLocale();

  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [subject,     setSubject]     = useState("");
  const [message,     setMessage]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [sent,        setSent]        = useState(false);

  // UTM tracking — lido da URL ao montar o componente
  const [utmSource,   setUtmSource]   = useState("direct");
  const [utmMedium,   setUtmMedium]   = useState("none");
  const [utmCampaign, setUtmCampaign] = useState("none");
  const [utmContent,  setUtmContent]  = useState("none");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmSource(params.get("utm_source")   || "direct");
    setUtmMedium(params.get("utm_medium")   || "none");
    setUtmCampaign(params.get("utm_campaign") || "none");
    setUtmContent(params.get("utm_content")  || "none");
  }, []);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim())    { setError(t("contactErrName"));    return; }
    if (!email.trim())   { setError(t("contactErrEmail"));   return; }
    if (!subject.trim()) { setError(t("contactErrSubject")); return; }
    if (!message.trim()) { setError(t("contactErrMessage")); return; }

    setLoading(true);
    try {
      const csrf = document.cookie
        .split("; ")
        .find((c) => c.startsWith("__csrf="))
        ?.split("=")[1] ?? "";
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          locale,
          utm_source:   utmSource,
          utm_medium:   utmMedium,
          utm_campaign: utmCampaign,
          utm_content:  utmContent,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : t("contactErrSend"));
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("contactErrSend"));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
          <svg className="text-accent-light w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t("contactSuccessTitle")}</h2>
        <p className="text-sm text-slate-400 mb-6">{t("contactSuccessBodyPublic")}</p>
        <Link
          href="/"
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
        >
          {t("contactSuccessBackHome")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-slate-300 mb-2">
            {t("contactNameLabel")} <span className="text-red-400">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("contactNamePlaceholder")}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-slate-300 mb-2">
            {t("contactEmailLabel")} <span className="text-red-400">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("contactEmailPlaceholder")}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-300 mb-2">
          {t("contactSubjectLabel")} <span className="text-red-400">*</span>
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t("contactSubjectPlaceholder")}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-slate-300 mb-2">
          {t("contactMessageLabel")} <span className="text-red-400">*</span>
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder={t("contactMessagePlaceholder")}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-light disabled:opacity-60"
      >
        {loading ? t("contactSubmitting") : t("contactSubmit")}
      </button>
    </form>
  );
}
