import Link from "next/link";

type RouteParams = { params: Promise<{ id: string }> };

export default async function PaymentSuccessPage({ params }: Readonly<RouteParams>) {
  const { id } = await params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center justify-center px-6 py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
          <svg className="h-10 w-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Pagamento confirmado!</h1>
        <p className="text-slate-400 mb-2">
          O pagamento foi processado com sucesso pelo Stripe.
        </p>
        <p className="text-slate-400 mb-8">
          O seu pedido entrou automaticamente em produção.
          Receberá um e-mail de confirmação em breve.
        </p>
        <Link
          href={`/portal/orders/${id}`}
          className="inline-flex items-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >
          Ver pedido →
        </Link>
      </div>
    </main>
  );
}
