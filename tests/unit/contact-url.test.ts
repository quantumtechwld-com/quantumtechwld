import { describe, it, expect } from "vitest";
import { getContactUrl } from "@/lib/contact-url";

describe("getContactUrl", () => {
  it("retorna /portal/contato para locale pt", () => {
    expect(getContactUrl("pt")).toBe("/portal/contato");
  });

  it("retorna /portal/contact para locale en", () => {
    expect(getContactUrl("en")).toBe("/portal/contact");
  });

  it("retorna /portal/contacto para locale es", () => {
    expect(getContactUrl("es")).toBe("/portal/contacto");
  });

  it("retorna /portal/contato para qualquer locale desconhecido (fallback pt)", () => {
    expect(getContactUrl("fr")).toBe("/portal/contato");
    expect(getContactUrl("")).toBe("/portal/contato");
  });
});
