import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CLIENT" | "ADMIN" | "DEVELOPER";
      status: "PENDING" | "ACTIVE" | "SUSPENDED";
      organizationId: string | null;
      orgRole: "ADMIN" | "MEMBER" | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CLIENT" | "ADMIN" | "DEVELOPER";
    status: "PENDING" | "ACTIVE" | "SUSPENDED";
    organizationId: string | null;
    orgRole: "ADMIN" | "MEMBER" | null;
  }
}
