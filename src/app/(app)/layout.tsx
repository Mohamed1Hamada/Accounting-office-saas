import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { getOfficeContext } from "@/lib/data";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const context = await getOfficeContext();

  return (
    <AppShell
      officeName={context.office?.name ?? "بدون مكتب"}
      demoMode={context.demoMode}
      officeRole={context.office?.role}
    >
      {children}
    </AppShell>
  );
}