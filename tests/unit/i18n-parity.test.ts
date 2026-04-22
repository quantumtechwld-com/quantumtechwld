/**
 * i18n Parity Test
 *
 * Garante que os 3 ficheiros de tradução (pt, en, es) têm exactamente
 * as mesmas chaves. Corre automaticamente no pre-commit via Vitest.
 *
 * Se esta suite falhar, significa que uma chave foi adicionada/removida
 * num ficheiro sem actualizar os restantes.
 */

import { describe, it, expect } from "vitest";
import pt from "../../messages/pt.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

type MessageObject = Record<string, unknown>;

/** Extrai todas as chaves dot-notation de um objecto JSON aninhado */
function extractKeys(obj: MessageObject, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return extractKeys(value as MessageObject, fullKey);
    }
    return [fullKey];
  });
}

const ptKeys = new Set(extractKeys(pt as MessageObject));
const enKeys = new Set(extractKeys(en as MessageObject));
const esKeys = new Set(extractKeys(es as MessageObject));

/** Chaves em A mas não em B */
function diff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((k) => !b.has(k)).sort((x, y) => x.localeCompare(y));
}

describe("i18n — paridade de chaves entre pt / en / es", () => {
  it("en.json não tem chaves a mais que pt.json", () => {
    const extra = diff(enKeys, ptKeys);
    expect(extra, `Chaves em EN mas não em PT:\n${extra.join("\n")}`).toHaveLength(0);
  });

  it("es.json não tem chaves a mais que pt.json", () => {
    const extra = diff(esKeys, ptKeys);
    expect(extra, `Chaves em ES mas não em PT:\n${extra.join("\n")}`).toHaveLength(0);
  });

  it("pt.json não tem chaves em falta relativamente a en.json", () => {
    const missing = diff(enKeys, ptKeys);
    expect(missing, `Chaves em EN mas não em PT:\n${missing.join("\n")}`).toHaveLength(0);
  });

  it("en.json tem todas as chaves de pt.json", () => {
    const missing = diff(ptKeys, enKeys);
    expect(
      missing,
      `Chaves presentes em PT mas AUSENTES em EN — adicionar traduções:\n${missing.join("\n")}`
    ).toHaveLength(0);
  });

  it("es.json tem todas as chaves de pt.json", () => {
    const missing = diff(ptKeys, esKeys);
    expect(
      missing,
      `Chaves presentes em PT mas AUSENTES em ES — adicionar traduções:\n${missing.join("\n")}`
    ).toHaveLength(0);
  });

  it("todos os ficheiros têm exactamente o mesmo número de chaves", () => {
    expect(enKeys.size, `PT tem ${ptKeys.size} chaves, EN tem ${enKeys.size}`).toBe(ptKeys.size);
    expect(esKeys.size, `PT tem ${ptKeys.size} chaves, ES tem ${esKeys.size}`).toBe(ptKeys.size);
  });
});
