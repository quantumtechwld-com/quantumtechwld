/** Retorna a URL da página de contato do portal de acordo com o locale. */
export function getContactUrl(locale: string): string {
  if (locale === "en") return "/portal/contact";
  if (locale === "es") return "/portal/contacto";
  return "/portal/contato";
}
