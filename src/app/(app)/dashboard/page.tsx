import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/badge";
import { SubmitButton } from "@/components/button";
import { createOffice } from "@/lib/actions/app";
import { OFFICE_NAME } from "@/lib/brand";
import { getDashboardData, getOfficeContext } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const context = await getOfficeContext();

  if (!context.office) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          title={`تجهيز مكتب ${OFFICE_NAME}`}
          description="اضغط إنشاء المكتب مرة واحدة فقط لتجهيز النظام وإضافة حسابك كمالك للمكتب تلقائيًا."
          action={
            <form action={createOffice} className="mx-auto mt-6 grid max-w-lg gap-4 text-right">
              <div>
                <label className="label">اسم المكتب</label>
                <input className="input" name="name" required defaultValue={OFFICE_NAME} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">الهاتف</label>
                  <input className="input" name="phone" />
                </div>
                <div>
                  <label className="label">البريد</label>
                  <input className="input" name="email" type="email" />
                </div>
              </div>
              <SubmitButton>إنشاء المكتب</SubmitButton>
            </form>
          }
        />
      </div>
    );
  }

  const data = await getDashboardData(context.office.id);

  return (
    <>
      <PageHeader
        title={`لوحة تحكم ${OFFICE_NAME}`}
        description="نظرة سريعة على العملاء، المهام، المواعيد والمستندات."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="العملاء" value={data.stats.clients} hint="إجمالي العملاء المسجلين" />
        <StatCard title="مهام مفتوحة" value={data.stats.activeTasks} hint="Pending / In progress / Review" />
        <StatCard title="مواعيد قادمة" value={data.stats.upcomingDeadlines} hint="إقرارات وفحوصات ومقابلات" />
        <StatCard title="مستندات" value={data.stats.documents} hint="ملفات مرفوعة على Storage" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black">آخر العملاء</h2>
            <Link href="/clients" className="text-sm font-bold text-slate-600 hover:text-slate-950">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {data.clients.map((client) => (
              <Link key={client.id} href={`/clients/${client.id}`} className="block rounded-2xl border border-slate-100 p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{client.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{client.email ?? client.phone ?? "لا توجد بيانات تواصل"}</p>
                  </div>
                  <Badge value={client.status}>{client.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black">المهام الحديثة</h2>
            <Link href="/tasks" className="text-sm font-bold text-slate-600 hover:text-slate-950">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {data.tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.client_name ?? "بدون عميل"} · {formatDateTime(task.due_date)}</p>
                  </div>
                  <Badge value={task.priority}>{task.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
