import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { verifyCsrf } from "@/lib/csrf";

describe("verifyCsrf", () => {
  it("aceita cookie e header quando o token coincide", () => {
    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: {
        cookie: "__csrf=token-123",
        "x-csrf-token": "token-123",
      },
    });

    expect(verifyCsrf(request)).toBe(true);
  });

  it("rejeita quando cookie e header divergem", () => {
    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: {
        cookie: "__csrf=token-123",
        "x-csrf-token": "token-999",
      },
    });

    expect(verifyCsrf(request)).toBe(false);
  });
});