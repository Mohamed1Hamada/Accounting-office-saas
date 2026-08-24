import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-950">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-950">← الرئيسية</Link>
        <h1 className="mt-6 text-4xl font-black">سياسة الخصوصية</h1>
        <p className="mt-4 leading-8 text-slate-600">
          يوضح هذا المستند كيف يتم التعامل مع بيانات المكتب والعملاء والمستندات داخل نظام إدارة حماده امام.
        </p>

        <section className="mt-8 space-y-4 leading-8 text-slate-700">
          <h2 className="text-xl font-black text-slate-950">البيانات التي يتم تخزينها</h2>
          <p>قد يتم تخزين أسماء العملاء، بيانات التواصل، الأرقام الضريبية، المهام، المواعيد، وأي مستندات يرفعها مستخدمو المكتب.</p>

          <h2 className="text-xl font-black text-slate-950">حماية البيانات</h2>
          <p>يتم عزل بيانات المكتب باستخدام Supabase Row Level Security، ولا يستطيع المستخدم الوصول إلا للبيانات التابعة للمكتب الذي ينتمي إليه.</p>

          <h2 className="text-xl font-black text-slate-950">المستندات</h2>
          <p>المستندات مخزنة في Supabase Storage بشكل خاص، ويتم فتحها عبر روابط مؤقتة Signed URLs حسب صلاحيات المستخدم.</p>

          <h2 className="text-xl font-black text-slate-950">مسؤولية العميل</h2>
          <p>مسؤول النظام أو مالك المكتب مسؤول عن صلاحيات الموظفين وعن التأكد من صحة البيانات المضافة إلى النظام.</p>

          <h2 className="text-xl font-black text-slate-950">التعديلات</h2>
          <p>قد يتم تحديث سياسة الخصوصية حسب متطلبات العميل أو القوانين المحلية أو طريقة استضافة النظام.</p>
        </section>
      </article>
    </main>
  );
}
