"use server";

import { headers } from "next/headers";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

type MagicLinkResult =
  | { ok: true }
  | { ok: false; code: "NOT_FOUND" | "PENDING" | "SUSPENDED" | "ERROR" };

export async function sendMagicLink(email: string): Promise<MagicLinkResult> {
  const cleanEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { status: true, role: true },
    });

    if (!user) return { ok: false, code: "NOT_FOUND" };
    if (user.status === "PENDING") return { ok: false, code: "PENDING" };
    if (user.status === "SUSPENDED") return { ok: false, code: "SUSPENDED" };

    const destination = user.role === "ADMIN" ? "/admin" : "/portal";

    // AUTH_URL é a variável correta no NextAuth v5; NEXTAUTH_URL é o nome legado.
    // Fallback por headers garante funcionamento mesmo sem a variável definida.
    const headersList = await headers();
    const baseUrl = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL)?.replace(/\/$/, "") ??
      `${headersList.get("x-forwarded-proto") ?? "https"}://${headersList.get("host")}`;

    await signIn("nodemailer", {
      email: cleanEmail,
      redirectTo: `${baseUrl}${destination}`,
    });

    // signIn lança NEXT_REDIRECT após enviar o email — não é erro real.
    // Se chegou aqui sem throw, o fluxo também é válido (alguns adapters não redirecionam).
    return { ok: true };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
        // Distingue redirect de sucesso (verifyRequest) de redirect de erro (/portal/erro).
      // Formato do digest: "NEXT_REDIRECT;replace|push;<url>"
      const digest = (err as { digest: string }).digest;
      const redirectUrl = digest.split(";")[2] ?? "";
      if (redirectUrl.includes("/portal/erro") || redirectUrl.includes("/api/auth/error")) {
        return { ok: false, code: "ERROR" };
      }
      return { ok: true };
    }
    return { ok: false, code: "ERROR" };
  }
}
