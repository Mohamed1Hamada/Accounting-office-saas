import Link from "next/link";
import { Badge } from "@/components/badge";
import { SubmitButton } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { createDeadline, deleteDeadline, updateDeadlineStatus } from "@/lib/actions/app";
import { getClients, getDeadlines, getOfficeContext } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function DeadlinesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const context = await getOfficeContext();
  const [deadlines, clients] = await Promise.all([
    getDeadlines(context.office?.id, params.q),
    getClients(context.office?.id),
  ]);

  return (
    <>
      <PageHeader title="المواعيد والـ Deadlines" description="مواعيد الإقرارات والفحص والاجتماعات مرتبطة بالعميل أو عامة للمكتب." />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form action={createDeadline} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
          <h2 className="mb-5 text-lg font-black">موعد جديد</h2>
          <div className="space-y-4">
            <div>
              <label className="label">العميل المرتبط</label>
              <select className="input" name="client_id" defaultValue="">
                <option value="">موعد عام بدون عميل</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">العنوان</label>
              <input className="input" name="title" required />
            </div>
            <div>
              <label className="label">تاريخ الموعد</label>
              <input className="input" name="deadline_date" type="datetime-local" required />
            </div>
            <div>
              <label className="label">الوصف</label>
              <textarea className="input min-h-28" name="description" />
            </div>
            <SubmitButton>إضافة الموعد</SubmitButton>
          </div>
        </form>

        <section>
          <form className="mb-4 flex gap-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <input className="input" name="q" defaultValue={params.q ?? ""} placeholder="بحث في المواعيد..." />
            <button className="rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white">بحث</button>
          </form>

          <div className="space-y-3">
            {deadlines.map((deadline) => (
              <div key={deadline.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-black text-slate-950">{deadline.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{deadline.client_name ?? "موعد عام بدون عميل"} · {formatDateTime(deadline.deadline_date)}</p>
                    {deadline.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{deadline.description}</p> : null}
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <Badge value={deadline.status}>{deadline.status}</Badge>
                    <form action={updateDeadlineStatus} className="flex gap-2">
                      <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
                      <input type="hidden" name="id" value={deadline.id} />
                      <select name="status" defaultValue={deadline.status ?? "upcoming"} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">
                        <option value="upcoming">Upcoming</option>
                        <option value="due_soon">Due soon</option>
                        <option value="overdue">Overdue</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white">تحديث</button>
                    </form>
                    <div className="flex gap-2">
                      <Link href={`/deadlines/${deadline.id}/edit`} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">تعديل</Link>
                      <form action={deleteDeadline}>
                        <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
                        <input type="hidden" name="id" value={deadline.id} />
                        <button className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">حذف</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
