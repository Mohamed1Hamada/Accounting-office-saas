import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { APP_NAME, OFFICE_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/clients", label: "العملاء" },
  { href: "/services", label: "الخدمات" },
  { href: "/tasks", label: "المهام" },
  { href: "/deadlines", label: "المواعيد" },
  { href: "/documents", label: "المستندات" },
  { href: "/staff", label: "الفريق" },
  { href: "/admin", label: "إدارة النظام" },
  { href: "/settings", label: "الإعدادات" },
];

export function AppShell({
  children,
  demoMode,
}: {
  children: React.ReactNode;
  officeName?: string;
  demoMode?: boolean;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 right-0 z-20 hidden w-72 border-l border-slate-200 bg-white p-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
            ح
          </div>
          <div>
            <p className="text-sm text-slate-500">{APP_NAME}</p>
            <h1 className="font-black">{OFFICE_NAME}</h1>
          </div>
        </Link>

        {demoMode ? (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800 ring-1 ring-amber-200">
            Demo Mode: ضيف مفاتيح Supabase في <code>.env.local</code> لتوصيل الداتا الحقيقية.
          </div>
        ) : null}

        <nav className="mt-7 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={signOut} className="absolute bottom-5 left-5 right-5">
          <button className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            تسجيل الخروج
          </button>
        </form>
      </aside>

      <div className="lg:pr-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 px-5 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="font-black">{OFFICE_NAME}</Link>
            <Link href="/settings" className="rounded-xl border border-slate-200 px-3 py-2 text-sm">الإعدادات</Link>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.slice(0, 7).map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
