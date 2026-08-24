import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-950">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-950">← الرئيسية</Link>
        <h1 className="mt-6 text-4xl font-black">الشروط والأحكام</h1>
        <p className="mt-4 leading-8 text-slate-600">
          باستخدام هذا النظام، يوافق مستخدمو المكتب على الالتزام بالشروط التالية.
        </p>

        <section className="mt-8 space-y-4 leading-8 text-slate-700">
          <h2 className="text-xl font-black text-slate-950">استخدام النظام</h2>
          <p>النظام مخصص لإدارة بيانات مكتب محاسبة واحد، بما يشمل العملاء والخدمات والمهام والمواعيد والمستندات.</p>

          <h2 className="text-xl font-black text-slate-950">صلاحيات المستخدمين</h2>
          <p>مالك المكتب هو المسؤول عن دعوة الموظفين وتحديد أدوارهم وصلاحياتهم داخل النظام.</p>

          <h2 className="text-xl font-black text-slate-950">دقة البيانات</h2>
          <p>يتحمل المستخدمون مسؤولية دقة البيانات والمستندات التي يتم إدخالها أو رفعها إلى النظام.</p>

          <h2 className="text-xl font-black text-slate-950">النسخ الاحتياطي</h2>
          <p>يُنصح بتفعيل خطة استضافة مناسبة تتضمن نسخًا احتياطية دورية لقاعدة البيانات والملفات.</p>

          <h2 className="text-xl font-black text-slate-950">التطوير والتخصيص</h2>
          <p>يمكن تخصيص النظام حسب احتياجات المكتب، ويجب مراجعة الصلاحيات وسياسات الأمان بعد أي تعديل جوهري.</p>
        </section>
      </article>
    </main>
  );
}
