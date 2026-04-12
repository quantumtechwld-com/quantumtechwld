// Esta rota é normalmente interceptada pelo middleware next-intl que faz
// rewrite interno para /[locale]/page.tsx. Este arquivo serve de fallback
// para o locale padrão (pt) caso o middleware não esteja ativo.
import { NextIntlClientProvider } from "next-intl";
import ptMessages from "../../messages/pt.json";
import HomeClient from "@/components/home/HomeClient";

export default function RootPage() {
  return (
    <NextIntlClientProvider locale="pt" messages={ptMessages}>
      <HomeClient />
    </NextIntlClientProvider>
  );
}
