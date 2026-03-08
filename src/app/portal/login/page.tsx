"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("nodemailer", { email, callbackUrl: "/portal", redirect: false });
    setSent(true);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur text-center">
        {sent ? (
          <>
            <p className="text-4xl mb-4">📬</p>
            <h1 className="text-2xl font-bold text-white mb-2">Verifique o seu e-mail</h1>
            <p className="text-slate-300 text-sm">
              Enviámos um link de acesso para <span className="text-sky-300 font-medium">{email}</span>.
              Clique no link para entrar no portal.
            </p>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm uppercase tracking-widest text-sky-300">Portal do Cliente</p>
            <h1 className="mb-1 text-2xl font-bold text-white">Aceder ao portal</h1>
            <p className="mb-6 text-sm text-slate-400">
              Introduza o seu e-mail e enviaremos um link de acesso instantâneo.
            </p>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="O seu e-mail"
                className="rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-sky-400 w-full"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-sky-500 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:opacity-60"
              >
                {loading ? "A enviar..." : "Enviar link de acesso →"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
