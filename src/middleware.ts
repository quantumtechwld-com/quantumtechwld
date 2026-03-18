import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe: usa authConfig sem PrismaAdapter.
// A verificação de role (ADMIN) é feita nos server components.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
