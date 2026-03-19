import Link from "next/link";

const ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  Verification: {
    title: "Link inválido ou expirado",
    body: "O link de acesso que utilizou já foi usado ou expirou. Os links são válidos por 24 horas e só podem ser usados uma vez.",
  },
  AccessDenied: {
    title: "Acesso negado",
    body: "Não tem permissão para aceder a esta página.",
  },
  Configuration: {
    title: "Erro de configuração",
    body: "Ocorreu um erro interno. Por favor contacte o suporte.",
  },
  Default: {
    title: "Erro de autenticação",
    body: "Não foi possível completar o início de sessão. Por favor tente novamente.",
  },
};

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AuthErrorPage({
  searchParams,
}: Readonly<{ searchParams: SearchParams }>) {
  const sp = await searchParams;
  const errorKey = sp.error ?? "Default";
  const { title, body } =
    ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.Default;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-300 text-sm mb-6">{body}</p>
        <Link
          href="/portal/login"
          className="inline-flex rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          Pedir novo link de acesso
        </Link>
      </div>
    </main>
  );
}
