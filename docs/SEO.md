# SEO — Documentação e Estratégia

> **Data de implementação inicial:** 31/03/2026
> **URL em produção:** https://quantumtechwld.com

---

## O que foi implementado

### 1. Metadata completo (`src/app/layout.tsx`)
- `metadataBase` apontando para `https://quantumtechwld.com`
- `title` com template `%s | QuantumTech` para subpáginas
- `description` reescrita com palavras-chave estratégicas
- `keywords` com termos de busca relevantes
- `canonical` URL definida
- `robots` configurado para indexação máxima (incluindo diretivas do Googlebot)

### 2. Open Graph + Twitter Card (`src/app/layout.tsx`)
- `openGraph`: tipo `website`, locale `pt_BR`, título, descrição, siteName
- `twitter`: card `summary_large_image`, título e descrição
- Permite preview rico ao compartilhar no WhatsApp, LinkedIn, X, Telegram

### 3. JSON-LD — Dados Estruturados (`src/app/layout.tsx`)
Inserido via `<script type="application/ld+json">` no `<head>`. Contém:
- `Organization` — identidade da empresa
- `WebSite` — vínculo com o publisher
- `WebPage` — página principal
- `ProfessionalService` — tipos de serviço oferecidos

Valide em: https://validator.schema.org/

### 4. `robots.txt` (`src/app/robots.ts`)
Gerado automaticamente pelo Next.js em `/robots.txt`. Configuração:
```
Allow: /
Disallow: /admin/, /portal/, /api/
Sitemap: https://quantumtechwld.com/sitemap.xml
```

### 5. `sitemap.xml` (`src/app/sitemap.ts`)
Gerado automaticamente pelo Next.js em `/sitemap.xml`. URLs incluídas:
- `/` — priority 1.0, changeFrequency monthly
- `/obrigado` — priority 0.3, changeFrequency yearly

**Adicionar novas URLs aqui sempre que criar novas páginas.**

### 6. OG Image dinâmica (`src/app/opengraph-image.tsx`)
Imagem 1200×630px gerada via `next/og` (Edge Runtime). Exibida como thumbnail ao compartilhar o site. Visualizar em: `/opengraph-image`

### 7. Subtítulo do hero (`src/components/home/HomeClient.tsx`)
Reescrito para incluir termos de busca reais:
> "Desenvolvimento web, sistemas sob medida, automação com n8n e IA — do primeiro MVP ao produto em produção. Diagnóstico gratuito em 24h."

---

## Como adicionar novas páginas ao sitemap

Editar `src/app/sitemap.ts` e adicionar o objeto:

```ts
{
  url: `${BASE_URL}/servicos/automacao-n8n`,
  lastModified: new Date("2026-04-01"),
  changeFrequency: "monthly",
  priority: 0.8,
},
```

---

## Checklist de SEO atual

| Item | Status |
|---|---|
| `metadataBase` + canonical | ✅ |
| Open Graph completo | ✅ |
| Twitter Card | ✅ |
| JSON-LD (Organization, WebSite, WebPage, Service) | ✅ |
| `robots.txt` | ✅ |
| `sitemap.xml` | ✅ |
| OG Image dinâmica | ✅ |
| `lang="pt-BR"` no `<html>` | ✅ |
| HTTPS | ✅ |
| Core Web Vitals (Next.js SSR + Geist font) | ✅ |
| Google Search Console configurado | ⬜ pendente |
| Google Business Profile | ⬜ pendente |
| Páginas individuais por serviço | ⬜ pendente |
| Blog / conteúdo indexável | ⬜ pendente |
| Backlinks externos | ⬜ pendente |

---

## Estratégia de ranqueamento

### Termos longtail — alcançáveis em 3–6 meses

| Termo | Dificuldade | Prazo estimado |
|---|---|---|
| agência automação n8n brasil | Baixa | 2–4 meses |
| desenvolvimento sistema sob medida [cidade] | Baixa | 1–3 meses |
| criar MVP rápido startup | Média | 3–6 meses |
| agência n8n openai integração | Baixa | 1–2 meses |
| agência desenvolvimento next.js | Média | 3–5 meses |

### Termos amplos — alta competição, longo prazo

"agência de desenvolvimento", "desenvolvimento web" — dominados por empresas com anos de DA e backlinks. Focar nos longtail primeiro.

---

## Próximas ações de alto impacto

1. **Google Search Console** — adicionar propriedade e enviar sitemap em `search.google.com/search-console`
2. **Google Business Profile** — criar perfil e vincular ao domínio
3. **Páginas de serviço individuais** — `/servicos/automacao-n8n`, `/servicos/sistemas-sob-medida`, `/servicos/websites`
4. **Blog técnico** — 3–5 artigos sobre n8n, automação, MVP (texto indexável = superfície de indexação)
5. **Backlinks** — artigo no dev.to, Tableless ou Medium linkando para o site

---

## Ferramentas de validação

| Ferramenta | URL |
|---|---|
| Rich Results Test (JSON-LD) | https://search.google.com/test/rich-results |
| Schema Validator | https://validator.schema.org/ |
| OG Preview | https://opengraph.xyz |
| PageSpeed / Core Web Vitals | https://pagespeed.web.dev |
| Robots.txt | https://quantumtechwld.com/robots.txt |
| Sitemap | https://quantumtechwld.com/sitemap.xml |
