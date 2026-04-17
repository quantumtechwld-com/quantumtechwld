/**
 * Gerador de referência única de pedido.
 *
 * Formato: {5 CHARS NOME}{AA}-{5 CHARS HASH}
 * Exemplo: ORANG26-A3K7M  (empresa "orangepmm")
 *          RICAR26-B9TZ2  (cliente "Ricardo")
 *
 * - 5 CHARS → primeiros 5 caracteres alfanuméricos do nome da empresa;
 *              se não houver empresa, usa o nome do cliente.
 * - AA      → 2 últimos dígitos do ano de criação
 * - 5 HASH  → hash aleatório alfanumérico uppercase (A-Z, 0-9)
 */

/**
 * Gera uma referência única para um pedido.
 * @param clientName   Nome da empresa ou, se ausente, nome do cliente
 * @param createdAt    Data de criação (default: agora)
 */
export function generateOrderRef(clientName: string, createdAt?: Date): string {
  const year = (createdAt ?? new Date()).getFullYear();
  const yy = String(year).slice(-2);

  const prefix = extractPrefix(clientName, 5);
  const hash = randomAlphanumeric(5);

  return `${prefix}${yy}-${hash}`;
}

/**
 * Tenta gerar um orderRef único com retry em caso de colisão de DB.
 * Retorna até `count` candidatos — o chamador deve persistir o primeiro
 * que não viole a constraint UNIQUE.
 */
export function generateOrderRefCandidates(
  clientName: string,
  createdAt?: Date,
  count = 5,
): string[] {
  return Array.from({ length: count }, () => generateOrderRef(clientName, createdAt));
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Primeiros `size` caracteres alfanuméricos do nome, uppercase, sem acentos. */
function extractPrefix(name: string, size: number): string {
  const clean = name
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "") // remove acentos
    .replaceAll(/[^a-zA-Z0-9]/g, "")    // apenas alfanuméricos
    .toUpperCase();

  const prefix = clean.slice(0, size);

  // Preenche com 'X' se o nome for curto
  return prefix.padEnd(size, "X");
}

function randomAlphanumeric(length: number): string {
  // eslint-disable-next-line no-secrets/no-secrets
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
