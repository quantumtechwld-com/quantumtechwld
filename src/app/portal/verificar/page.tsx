import Link from "next/link";

export default function VerificarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur text-center">
        <p className="text-4xl mb-4">✉️</p>
        <h1 className="text-2xl font-bold text-white mb-2">Link enviado!</h1>
        <p className="text-slate-300 text-sm mb-6">
          Verifique a sua caixa de entrada (e a pasta de spam). O link expira em 24 horas.
        </p>
        <Link href="/" className="text-sm text-sky-400 hover:underline">
          ← Voltar ao site
        </Link>
      </div>
    </main>
  );
}
