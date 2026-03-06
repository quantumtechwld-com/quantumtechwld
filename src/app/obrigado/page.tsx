import Link from "next/link";

export default function ObrigadoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-3xl border border-white/15 bg-white/10 p-10 text-center backdrop-blur">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-sky-200">Lead recebido</p>
        <h1 className="mb-4 text-4xl font-bold text-white">Obrigado pelo contato!</h1>
        <p className="mb-8 text-slate-200">
          Seu pedido já foi enviado para nosso fluxo de atendimento. Em breve você
          receberá retorno por e-mail ou WhatsApp.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
        >
          Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}
