import Link from "next/link";
import { signInWithPassword } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/env";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-5">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">ح</div>
          <span className="font-black text-slate-950">نظام إدارة مكتب حماده امام</span>
        </Link>

        <h1 className="text-3xl font-black text-slate-950">تسجيل الدخول</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">ادخل بحسابك للوصول للوحة تحكم المكتب.</p>

        {!isSupabaseConfigured ? (
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800 ring-1 ring-amber-200">
            مفاتيح Supabase غير مضافة. التطبيق يعمل Demo Mode. انسخ <code>.env.local.example</code> إلى <code>.env.local</code>.
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">{params.error}</div>
        ) : null}
        {params.message ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 ring-1 ring-emerald-200">{params.message}</div>
        ) : null}

        <form action={signInWithPassword} className="mt-7 space-y-4">
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input className="input" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <input className="input" name="password" type="password" required minLength={6} />
          </div>
          <button className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 font-black text-white hover:bg-slate-800">
            دخول
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          معندكش حساب؟ <Link href="/signup" className="font-bold text-slate-950">إنشاء حساب</Link>
        </p>
      </div>
    </main>
  );
}
