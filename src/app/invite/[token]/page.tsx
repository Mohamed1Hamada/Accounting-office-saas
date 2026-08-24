import Link from "next/link";
import { acceptInvitation } from "@/lib/actions/app";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-5 text-slate-950">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-7 shadow-2xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">ح</div>
          <span className="font-black">نظام إدارة مكتب حماده امام</span>
        </Link>

        <h1 className="text-3xl font-black">قبول دعوة الانضمام</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          لازم تكون مسجل دخول بنفس البريد الإلكتروني الذي تم إرسال الدعوة له.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm leading-6 text-rose-700 ring-1 ring-rose-200">
            {error}
          </div>
        ) : null}

        {!isSupabaseConfigured ? (
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800 ring-1 ring-amber-200">
            Demo Mode: ضيف مفاتيح Supabase لتفعيل قبول الدعوات.
          </div>
        ) : null}

        {!data.user ? (
          <div className="mt-7 space-y-3">
            <Link href="/login" className="block rounded-2xl bg-slate-950 px-5 py-3 text-center font-black text-white">تسجيل الدخول أولًا</Link>
            <Link href="/signup" className="block rounded-2xl border border-slate-200 px-5 py-3 text-center font-black text-slate-700">إنشاء حساب</Link>
          </div>
        ) : (
          <form action={acceptInvitation} className="mt-7">
            <input type="hidden" name="token" value={token} />
            <button className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 font-black text-white hover:bg-slate-800">
              قبول الدعوة
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
