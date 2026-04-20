import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("https://example.test/webhook/lead", async () => HttpResponse.json({ ok: true })),
];