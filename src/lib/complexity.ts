export type ComplexityResult = {
  score: number; // 1–10
  hoursMin: number;
  hoursMax: number;
  label: "Simples" | "Médio" | "Complexo" | "Enterprise";
  color: "green" | "yellow" | "orange" | "red";
};

// Horas-base por tipo de projeto (min, max)
const BASE_HOURS: Record<string, [number, number]> = {
  website:    [40,  120],
  webapp:     [150, 400],
  mobile:     [200, 500],
  ecommerce:  [120, 300],
  automation: [60,  200],
  system:     [200, 600],
};

// Peso de cada funcionalidade (horas adicionais)
const FEATURE_WEIGHT: Record<string, [number, number]> = {
  "Autenticação de usuários":  [20, 40],
  "Painel administrativo":     [30, 60],
  "Pagamentos online":         [20, 50],
  "E-mails automáticos":       [10, 20],
  "Dashboard com gráficos":    [20, 50],
  "API para integrações":      [20, 40],
  "Chat / Suporte":            [30, 60],
  "Blog / CMS":                [20, 40],
  "Multi-idioma":              [15, 30],
  "Notificações push":         [10, 25],
  "Relatórios exportáveis":    [15, 35],
  "Integração com ERP/CRM":   [30, 70],
};

export function computeComplexity(
  projectType: string,
  features: string[],
  customFeatures: string
): ComplexityResult {
  const [baseMin, baseMax] = BASE_HOURS[projectType] ?? [80, 200];

  let addMin = 0;
  let addMax = 0;

  for (const f of features) {
    const w = FEATURE_WEIGHT[f];
    if (w) {
      addMin += w[0];
      addMax += w[1];
    }
  }

  // Funcionalidades livres longas adicionam estimativa flat
  if (customFeatures.trim().length > 30) {
    addMin += 20;
    addMax += 60;
  }

  const hoursMin = baseMin + addMin;
  const hoursMax = baseMax + addMax;
  const avg = (hoursMin + hoursMax) / 2;

  let score: number;
  if (avg <= 80)        score = 1;
  else if (avg <= 150)  score = 2;
  else if (avg <= 250)  score = 3;
  else if (avg <= 350)  score = 4;
  else if (avg <= 450)  score = 5;
  else if (avg <= 600)  score = 6;
  else if (avg <= 750)  score = 7;
  else if (avg <= 950)  score = 8;
  else if (avg <= 1200) score = 9;
  else                  score = 10;

  let label: ComplexityResult["label"];
  let color: ComplexityResult["color"];

  if (score <= 3)       { label = "Simples";    color = "green"; }
  else if (score <= 5)  { label = "Médio";      color = "yellow"; }
  else if (score <= 7)  { label = "Complexo";   color = "orange"; }
  else                  { label = "Enterprise"; color = "red"; }

  return { score, hoursMin, hoursMax, label, color };
}
