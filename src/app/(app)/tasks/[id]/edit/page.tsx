import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { updateTask } from "@/lib/actions/app";
import { getClients, getOfficeContext, getTask } from "@/lib/data";

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getOfficeContext();
  if (!context.office) notFound();

  const [task, clients] = await Promise.all([getTask(context.office.id, id), getClients(context.office.id)]);
  if (!task) notFound();

  return (
    <>
      <PageHeader title={`تعديل مهمة: ${task.title}`} description="تعديل بيانات المهمة والعميل المرتبط والحالة." />
      <form action={updateTask} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="office_id" value={context.office.id} />
        <input type="hidden" name="id" value={task.id} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">العميل المرتبط</label>
            <select className="input" name="client_id" defaultValue={task.client_id ?? ""}>
              <option value="">مهمة عامة بدون عميل</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">العنوان</label>
            <input className="input" name="title" required defaultValue={task.title} />
          </div>
          <div>
            <label className="label">الأولوية</label>
            <select className="input" name="priority" defaultValue={task.priority ?? "medium"}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="label">الحالة</label>
            <select className="input" name="status" defaultValue={task.status ?? "pending"}>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="in_review">In review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">تاريخ الاستحقاق</label>
            <input className="input" name="due_date" type="datetime-local" defaultValue={toDateTimeLocal(task.due_date)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">الوصف</label>
            <textarea className="input min-h-28" name="description" defaultValue={task.description ?? ""} />
          </div>
        </div>
        <div className="mt-6"><SubmitButton>حفظ المهمة</SubmitButton></div>
      </form>
    </>
  );
}
