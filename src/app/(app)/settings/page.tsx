import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getOfficeContext } from "@/lib/data";

export default async function SettingsPage() {
  const context = await getOfficeContext();

  return (
    <>
      <PageHeader title="الإعدادات" description="بيانات المكتب وإعدادات الإنتاج والبريد الإلكتروني." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-black">بيانات المكتب</h2>
          <dl className="space-y-4 text-sm">
            <Info label="اسم المكتب" value={context.office?.name} />
            <Info label="Office ID" value={context.office?.id} />
            <Info label="دورك" value={context.office?.role} />
            <Info label="وضع التشغيل" value={context.demoMode ? "Demo Mode" : "Connected to Supabase"} />
          </dl>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-black">Checklist قبل تسليم العميل</h2>
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>✅ Confirm email مفعّل في Supabase.</li>
            <li>✅ Redirect URLs فيها دومين Vercel أو الدومين النهائي.</li>
            <li>✅ Environment Variables مضافة في Vercel.</li>
            <li>✅ صفحة Privacy و Terms موجودة.</li>
            <li>✅ جرّبت إنشاء عميل وخدمة ومهمة وموعد ومستند.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-lg font-black">تجهيز Email SMTP باستخدام Resend</h2>
          <ol className="space-y-3 text-sm leading-7 text-slate-600">
            <li>1. افتح <a className="font-bold text-slate-950 underline" href="https://resend.com" target="_blank">resend.com</a> واعمل حساب.</li>
            <li>2. أضف الدومين الخاص بك وفعّل DNS records من لوحة تحكم الدومين.</li>
            <li>3. من Resend → SMTP انسخ بيانات: Host, Port, Username, Password.</li>
            <li>4. افتح Supabase → Authentication → Emails → Set up SMTP.</li>
            <li>5. أدخل بيانات Resend SMTP واحفظ.</li>
            <li>6. جرّب تسجيل حساب جديد وتأكد أن رسالة التأكيد وصلت من بريد الدومين الخاص بك.</li>
          </ol>
          <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800 ring-1 ring-amber-200">
            لا تضع بيانات SMTP داخل كود Next.js. إعداد SMTP يتم من Supabase Dashboard فقط.
          </p>
          <div className="mt-5 flex gap-3">
            <Link href="/privacy" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Privacy</Link>
            <Link href="/terms" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Terms</Link>
          </div>
        </section>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-bold text-slate-400">{label}</dt>
      <dd className="mt-1 break-all font-semibold text-slate-800">{value || "—"}</dd>
    </div>
  );
}
