import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CLIENT" | "ADMIN";
      status: "PENDING" | "ACTIVE" | "SUSPENDED";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CLIENT" | "ADMIN";
    status: "PENDING" | "ACTIVE" | "SUSPENDED";
  }
}
