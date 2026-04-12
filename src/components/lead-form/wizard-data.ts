// ─── Dados do wizard ──────────────────────────────────────────────────────────

export const PROJECT_TYPES = [
  { value: "website", label: "Website", icon: "🌐", description: "Landing page, institucional ou portfólio" },
  { value: "webapp", label: "Aplicação Web", icon: "💻", description: "Sistema ou plataforma web completa" },
  { value: "mobile", label: "App Mobile", icon: "📱", description: "iOS, Android ou híbrido" },
  { value: "ecommerce", label: "E-commerce", icon: "🛒", description: "Loja virtual com pagamentos" },
  { value: "automation", label: "Automação / IA", icon: "🤖", description: "Integrações, n8n, bots e IA" },
  { value: "system", label: "Sistema Interno", icon: "⚙️", description: "ERP, CRM, painel ou backoffice" },
];

export const FEATURES = [
  "Autenticação de usuários",
  "Painel administrativo",
  "Pagamentos online",
  "E-mails automáticos",
  "Dashboard com gráficos",
  "API para integrações",
  "Chat / Suporte",
  "Blog / CMS",
  "Multi-idioma",
  "Notificações push",
  "Relatórios exportáveis",
  "Integração com ERP/CRM",
];

export const BUDGETS = [
  { value: "Até €3.000", sub: "Projetos simples" },
  { value: "€3.000 – €8.000", sub: "Médio porte" },
  { value: "€8.000 – €20.000", sub: "Alto porte" },
  { value: "Acima de €20.000", sub: "Enterprise" },
];

export const TIMELINES = [
  { value: "Urgente (< 30 dias)", sub: "Preciso logo" },
  { value: "Normal (1–3 meses)", sub: "Prazo padrão" },
  { value: "Planejado (3–6 meses)", sub: "Sem pressa" },
  { value: "Flexível", sub: "Sem prazo definido" },
];

export const STEPS = [
  { title: "Tipo de projeto", sub: "O que você precisa construir?" },
  { title: "Desafio & Público", sub: "Qual problema isso resolve?" },
  { title: "Funcionalidades", sub: "O que o sistema precisa fazer?" },
  { title: "Orçamento & Prazo", sub: "Qual o escopo esperado?" },
  { title: "Seus dados", sub: "Como podemos entrar em contato?" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type WizardState = {
  projectType: string;
  painPoints: string;
  targetAudience: string;
  features: string[];
  customFeatures: string;
  budget: string;
  timeline: string;
  name: string;
  email: string;
  company: string;
};

export const initialWizardState: WizardState = {
  projectType: "",
  painPoints: "",
  targetAudience: "",
  features: [],
  customFeatures: "",
  budget: "",
  timeline: "",
  name: "",
  email: "",
  company: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function toggleFeature(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((f) => f !== item) : [...list, item];
}

export function canAdvance(step: number, state: WizardState): boolean {
  if (step === 0) return Boolean(state.projectType);
  if (step === 1) return Boolean(state.painPoints.trim() && state.targetAudience.trim());
  if (step === 2) return state.features.length > 0 || Boolean(state.customFeatures.trim());
  if (step === 3) return Boolean(state.budget && state.timeline);
  if (step === 4) return Boolean(state.name.trim() && state.email.trim());
  return false;
}

export const INPUT_CLS =
  "rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-accent w-full";

export { computeComplexity } from "@/lib/complexity";
