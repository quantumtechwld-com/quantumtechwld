"use server";

import { signIn } from "@/auth";

export async function sendMagicLink(email: string) {
  await signIn("nodemailer", {
    email,
    redirectTo: "/portal/verificar",
  });
}
