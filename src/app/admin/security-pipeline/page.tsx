import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MermaidViewer } from "./MermaidViewer";

export const metadata = {
  title: "Pipeline de Segurança — Admin",
  robots: "noindex,nofollow",
};

const TOOLS_TABLE = [
  {
    tool: "SonarQube / SonarCloud",
    category: "Qualidade de código",
    role: "SAST: detecta XSS, SQL injection, code smells de segurança",
  },
  {
    tool: "ESLint + plugins",
    category: "Linting",
    role: "eslint-plugin-security, eslint-plugin-no-secrets",
  },
  {
    tool: "gitleaks",
    category: "Detecção de secrets",
    role: "Escaneia arquivos staged — bloqueia API keys e tokens em cleartext",
  },
  {
    tool: "Prisma CLI",
    category: "Banco de dados",
    role: "Migrations controladas, guardrails contra comandos destrutivos",
  },
  {
    tool: "GitHub Actions",
    category: "Orquestração CI/CD",
    role: "Pipeline com gates de segurança (SAST, SCA, typecheck)",
  },
  {
    tool: "Husky + lint-staged",
    category: "Pre-commit",
    role: "Orquestra 3 camadas antes de cada commit (gitleaks → tsc → eslint)",
  },
];

const CHECKLIST = [
  "SAST/SCA no pipeline (SonarQube + ESLint)",
  "Security Headers: CSP, CSRF double-submit, HSTS",
  "Validação dupla de input e output com Zod",
  "server-only para módulos de servidor",
  "Cookies seguros: HttpOnly, Secure, SameSite=Strict",
  "Backup diário S3 com retenção de 7 dias",
  "Monitoramento pós-deploy via Sentry (client / server / edge)",
  "Queries Prisma com select explícito — sem over-fetching",
];

export default async function SecurityPipelinePage() {
  const session = await auth();
  // Dupla verificação de role no Server Component — defense in depth
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    redirect("/portal/erro?reason=forbidden");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <header className="space-y-2">
          <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            Painel Admin · Documentação Técnica
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Pipeline de Segurança
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Visão completa das camadas de segurança do projeto — da análise estática ao
            monitoramento em produção. Visível apenas para usuários com role <code className="text-indigo-300">ADMIN</code>.
          </p>
        </header>

        {/* Diagrama Mermaid */}
        <section>
          <h2 className="text-lg font-semibold text-indigo-300 mb-4">Fluxo do Pipeline</h2>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 overflow-x-auto">
            <MermaidViewer />
          </div>
        </section>

        {/* Tabela de ferramentas */}
        <section>
          <h2 className="text-lg font-semibold text-indigo-300 mb-4">Ferramentas Ativas</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-slate-400 text-left">
                  <th className="px-4 py-3 font-semibold">Ferramenta</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Função</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS_TABLE.map((row, i) => (
                  <tr
                    key={row.tool}
                    className={`border-t border-slate-700 ${i % 2 === 0 ? "bg-slate-900" : "bg-slate-950"}`}
                  >
                    <td className="px-4 py-3 font-medium text-white">{row.tool}</td>
                    <td className="px-4 py-3 text-indigo-300">{row.category}</td>
                    <td className="px-4 py-3 text-slate-400">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Checklist */}
        <section>
          <h2 className="text-lg font-semibold text-indigo-300 mb-4">Checklist de Segurança</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHECKLIST.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm"
              >
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
                <span className="text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Rodapé */}
        <footer className="text-xs text-slate-600 pt-4 border-t border-slate-800">
          Quantum Technology Agency · Pipeline de Segurança · Atualizado em Abril 2026
        </footer>

      </div>
    </div>
  );
}
