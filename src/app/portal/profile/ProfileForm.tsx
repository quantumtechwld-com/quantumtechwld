"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type User = {
  name:    string | null;
  email:   string | null;
  phone:   string | null;
  company: string | null;
};

export function ProfileForm({ user }: Readonly<{ user: User }>) {
  const t = useTranslations("portal");
  const router  = useRouter();
  const [phone,   setPhone]   = useState(user.phone   ?? "");
  const [company, setCompany] = useState(user.company ?? "");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone, company }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? t("profileErrSave"));
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("profileErrUnexpected"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div>
        <p className="block text-sm font-medium text-slate-300 mb-1.5">{t("profileEmail")}</p>
        <div className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-slate-400 text-sm">
          {user.email}
        </div>
        <p className="mt-1 text-xs text-slate-600">{t("profileEmailReadonly")}</p>
      </div>

      <div>
        <p className="block text-sm font-medium text-slate-300 mb-1.5">{t("profileName")}</p>
        <div className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-slate-400 text-sm">
          {user.name}
        </div>
        <p className="mt-1 text-xs text-slate-600">{t("profileNameReadonly")}</p>
      </div>

      <div>
        <label htmlFor="profile-company" className="block text-sm font-medium text-slate-300 mb-1.5">{t("profileCompany")}</label>
        <input
          id="profile-company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder={t("profileCompanyPlaceholder")}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-300 mb-1.5">{t("profilePhone")}</label>
        <input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("profilePhonePlaceholder")}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-accent focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {t("profileSaved")}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light disabled:opacity-60"
        >
          {loading ? t("profileSaving") : t("profileSave")}
        </button>
      </div>
    </form>
  );
}

