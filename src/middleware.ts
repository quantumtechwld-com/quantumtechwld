import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe: usa authConfig sem PrismaAdapter.
export default NextAuth(authConfig).auth;

export const config = {
  // Protege /admin e /portal (exceto páginas públicas tratadas em authConfig.authorized)
  matcher: ["/admin/:path*", "/portal/:path*"],
};
