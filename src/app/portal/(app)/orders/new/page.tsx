import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NewOrderForm } from "./NewOrderForm";

export default async function NewOrderPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const t = await getTranslations("portal");

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-10">
        <Link href="/portal/orders" className="text-sm text-accent hover:text-accent-light transition-colors">
          {t("newOrderBack")}
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-white">{t("newOrderTitle")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("newOrderSubtitle")}</p>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
        <NewOrderForm />
      </div>
    </main>
  );
}
