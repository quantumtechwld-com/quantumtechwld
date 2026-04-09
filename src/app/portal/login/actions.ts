"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function sendMagicLink(email: string) {
  const cleanEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { status: true, role: true },
  });

  if (!user) {
    throw new Error("NOT_FOUND");
  }
  if (user.status === "PENDING") {
    throw new Error("PENDING");
  }
  if (user.status === "SUSPENDED") {
    throw new Error("SUSPENDED");
  }

  const destination = user.role === "ADMIN" ? "/admin" : "/portal";

  await signIn("nodemailer", {
    email: cleanEmail,
    redirectTo: destination,
  });
}
