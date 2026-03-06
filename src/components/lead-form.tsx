"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  company: "",
  service: "Website de alta conversão",
  budget: "Até €3.000",
  message: "",
};

export default function LeadForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Falha ao enviar lead.");
      }

      setForm(initialState);
      router.push("/obrigado");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Erro inesperado. Tente novamente.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur"
    >
      <h3 className="mb-5 text-2xl font-semibold text-white">Briefing rápido</h3>

      <div className="grid gap-4">
        <input
          required
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Seu nome"
          className="rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-slate-300 outline-none focus:border-sky-400"
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="Seu melhor e-mail"
          className="rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-slate-300 outline-none focus:border-sky-400"
        />
        <input
          value={form.company}
          onChange={(event) => setForm({ ...form, company: event.target.value })}
          placeholder="Empresa (opcional)"
          className="rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-slate-300 outline-none focus:border-sky-400"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={form.service}
            onChange={(event) => setForm({ ...form, service: event.target.value })}
            className="rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none focus:border-sky-400"
          >
            <option className="text-black">Website de alta conversão</option>
            <option className="text-black">Sistema sob medida</option>
            <option className="text-black">Automação com n8n + IA</option>
            <option className="text-black">Aplicação web completa</option>
          </select>

          <select
            value={form.budget}
            onChange={(event) => setForm({ ...form, budget: event.target.value })}
            className="rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none focus:border-sky-400"
          >
            <option className="text-black">Até €3.000</option>
            <option className="text-black">€3.000 - €8.000</option>
            <option className="text-black">€8.000 - €20.000</option>
            <option className="text-black">Acima de €20.000</option>
          </select>
        </div>

        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          placeholder="Descreva o que você precisa..."
          className="rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-slate-300 outline-none focus:border-sky-400"
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Enviando..." : "Enviar e falar com o agente"}
      </button>

      <p className="mt-3 text-xs text-slate-300">
        Ao enviar, você autoriza contato comercial relacionado ao seu projeto.
      </p>
    </form>
  );
}
