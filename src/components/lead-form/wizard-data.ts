// ─── Dados do wizard ──────────────────────────────────────────────────────────

// Identificadores de tipo de projeto (language-independent keys)
export const PROJECT_TYPE_VALUES = [
  "website", "webapp", "mobile", "ecommerce", "automation", "system",
] as const;
export type ProjectTypeValue = typeof PROJECT_TYPE_VALUES[number];

// Chaves de funcionalidades (language-independent keys)
export const FEATURE_KEYS = [
  "auth", "admin", "payments", "emails", "dashboard", "api",
  "chat", "blog", "i18n", "push", "reports", "erp",
] as const;
export type FeatureKey = typeof FEATURE_KEYS[number];

// Chaves de orçamento (language-independent)
export const BUDGET_KEYS = ["under3k", "3k-8k", "8k-20k", "over20k"] as const;
export type BudgetKey = typeof BUDGET_KEYS[number];

// Chaves de prazo (language-independent)
export const TIMELINE_KEYS = ["urgent", "normal", "planned", "flexible"] as const;
export type TimelineKey = typeof TIMELINE_KEYS[number];

// Número de etapas do wizard
export const STEP_COUNT = 5;

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
