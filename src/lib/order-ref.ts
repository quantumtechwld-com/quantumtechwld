/**
 * Gerador de referência única de pedido.
 *
 * Formato: {5 INICIAIS}{AA}-{5 CHARS HASH}
 * Exemplo: DAWGF26-A3K7M
 *
 * - 5 INICIAIS → primeiras letras das primeiras palavras significativas da descrição
 * - AA         → 2 últimos dígitos do ano de criação
 * - 5 CHARS    → hash aleatório alfanumérico uppercase (A-Z, 0-9)
 */

const STOP_WORDS = new Set([
  // PT
  "de", "do", "da", "dos", "das", "para", "por", "e", "em", "o", "a",
  "os", "as", "um", "uma", "com", "que", "no", "na", "ao", "à", "aos",
  "às", "se", "é", "ou", "mas", "mais", "então", "quando", "como",
  // EN
  "is", "to", "the", "in", "of", "and", "or", "for", "an", "at",
]);

/**
 * Gera uma referência única para um pedido.
 * @param description  Descrição do pedido
 * @param createdAt    Data de criação (default: agora)
 */
export function generateOrderRef(description: string, createdAt?: Date): string {
  const year = (createdAt ?? new Date()).getFullYear();
  const yy = String(year).slice(-2);

  const prefix = extractInitials(description, 5);
  const hash = randomAlphanumeric(5);

  return `${prefix}${yy}-${hash}`;
}

/**
 * Tenta gerar um orderRef único com retry em caso de colisão de DB.
 * Retorna até `maxAttempts` candidatos — o chamador deve persistir o primeiro
 * que não viole a constraint UNIQUE.
 */
export function generateOrderRefCandidates(
  description: string,
  createdAt?: Date,
  count = 5,
): string[] {
  return Array.from({ length: count }, () => generateOrderRef(description, createdAt));
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function extractInitials(text: string, size: number): string {
  const words = text
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "") // remove acentos
    .replaceAll(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w.toLowerCase()));

  const initials: string[] = [];
  for (const w of words) {
    if (initials.length >= size) break;
    initials.push(w[0].toUpperCase());
  }

  // Preenche com 'X' se não há palavras suficientes
  while (initials.length < size) initials.push("X");

  return initials.join("");
}

function randomAlphanumeric(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
