"use server";

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

    await signIn("nodemailer", {
      email: cleanEmail,
      redirectTo: destination,
    });

    return { ok: true };
  } catch (err: unknown) {
    // signIn redireciona internamente e lança NEXT_REDIRECT — não é erro real
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      return { ok: true };
    }
    return { ok: false, code: "ERROR" };
  }
}
