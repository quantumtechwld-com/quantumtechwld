import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Mail, MailOpen } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(d);
}

export default async function AdminContactsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/portal");

  const contacts: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }[] = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unread = contacts.filter((c) => !c.read).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mensagens de Contato</h1>
            <p className="mt-1 text-sm text-slate-400">
              Formulário público — visitantes sem cadastro
            </p>
          </div>
          {unread > 0 && (
            <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-accent">
              {unread} não lida{unread > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {contacts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/3 py-20 text-center">
            <Mail size={40} className="mx-auto mb-4 text-slate-500" />
            <p className="text-slate-400">Nenhuma mensagem recebida ainda.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contacts.map((c) => (
              <div
                key={c.id}
                className={`rounded-2xl border p-6 transition-colors ${
                  c.read
                    ? "border-white/8 bg-white/3"
                    : "border-accent/25 bg-accent/5"
                }`}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {c.read ? (
                      <MailOpen size={16} className="shrink-0 text-slate-500" />
                    ) : (
                      <Mail size={16} className="shrink-0 text-accent" />
                    )}
                    <span className="font-semibold text-white">{c.name}</span>
                    <a
                      href={`mailto:${c.email}`}
                      className="text-sm text-accent hover:underline"
                    >
                      {c.email}
                    </a>
                  </div>
                  <span className="text-xs text-slate-500">{fmtDate(c.createdAt)}</span>
                </div>
                <p className="mb-3 text-sm font-medium text-slate-200">{c.subject}</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-400">
                  {c.message}
                </p>
                {!c.read && (
                  <form
                    action={`/api/admin/contacts/${c.id}/read`}
                    method="POST"
                    className="mt-4"
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white/10"
                    >
                      Marcar como lida
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
