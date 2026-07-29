interface UtmOptions {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
}

/** Retorna a URL da página de contato do portal de acordo com o locale e parâmetros UTM opcionais. */
export function getContactUrl(locale: string, utm?: UtmOptions): string {
  let base = "/portal/contato";
  if (locale === "en") base = "/portal/contact";
  if (locale === "es") base = "/portal/contacto";

  if (!utm) return base;

  const params = new URLSearchParams();
  if (utm.source)   params.set("utm_source",   utm.source);
  if (utm.medium)   params.set("utm_medium",   utm.medium);
  if (utm.campaign) params.set("utm_campaign", utm.campaign);
  if (utm.content)  params.set("utm_content",  utm.content);

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
