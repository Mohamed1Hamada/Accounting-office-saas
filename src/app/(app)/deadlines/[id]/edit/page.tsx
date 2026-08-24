import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { updateDeadline } from "@/lib/actions/app";
import { getClients, getDeadline, getOfficeContext } from "@/lib/data";

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default async function EditDeadlinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getOfficeContext();
  if (!context.office) notFound();

  const [deadline, clients] = await Promise.all([getDeadline(context.office.id, id), getClients(context.office.id)]);
  if (!deadline) notFound();

  return (
    <>
      <PageHeader title={`تعديل موعد: ${deadline.title}`} description="تعديل بيانات الموعد والعميل المرتبط والحالة." />
      <form action={updateDeadline} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="office_id" value={context.office.id} />
        <input type="hidden" name="id" value={deadline.id} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">العميل المرتبط</label>
            <select className="input" name="client_id" defaultValue={deadline.client_id ?? ""}>
              <option value="">موعد عام بدون عميل</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">العنوان</label>
            <input className="input" name="title" required defaultValue={deadline.title} />
          </div>
          <div>
            <label className="label">الحالة</label>
            <select className="input" name="status" defaultValue={deadline.status ?? "upcoming"}>
              <option value="upcoming">Upcoming</option>
              <option value="due_soon">Due soon</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label">تاريخ الموعد</label>
            <input className="input" name="deadline_date" type="datetime-local" required defaultValue={toDateTimeLocal(deadline.deadline_date)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">الوصف</label>
            <textarea className="input min-h-28" name="description" defaultValue={deadline.description ?? ""} />
          </div>
        </div>
        <div className="mt-6"><SubmitButton>حفظ الموعد</SubmitButton></div>
      </form>
    </>
  );
}
