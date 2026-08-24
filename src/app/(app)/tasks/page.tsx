import Link from "next/link";
import { Badge } from "@/components/badge";
import { SubmitButton } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { createTask, deleteTask, updateTaskStatus } from "@/lib/actions/app";
import { getClients, getOfficeContext, getTasks } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const context = await getOfficeContext();
  const [tasks, clients] = await Promise.all([
    getTasks(context.office?.id, params.q),
    getClients(context.office?.id),
  ]);

  return (
    <>
      <PageHeader title="المهام" description="تابع مهام المكتب واربط كل مهمة بعميل محدد أو اتركها عامة." />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form action={createTask} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
          <h2 className="mb-5 text-lg font-black">مهمة جديدة</h2>
          <div className="space-y-4">
            <div>
              <label className="label">العميل المرتبط</label>
              <select className="input" name="client_id" defaultValue="">
                <option value="">مهمة عامة بدون عميل</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">العنوان</label>
              <input className="input" name="title" required />
            </div>
            <div>
              <label className="label">الأولوية</label>
              <select className="input" name="priority" defaultValue="medium">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">تاريخ الاستحقاق</label>
              <input className="input" name="due_date" type="datetime-local" />
            </div>
            <div>
              <label className="label">الوصف</label>
              <textarea className="input min-h-28" name="description" />
            </div>
            <SubmitButton>إضافة المهمة</SubmitButton>
          </div>
        </form>

        <section>
          <form className="mb-4 flex gap-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <input className="input" name="q" defaultValue={params.q ?? ""} placeholder="بحث في المهام..." />
            <button className="rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white">بحث</button>
          </form>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-black text-slate-950">{task.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{task.client_name ?? "مهمة عامة بدون عميل"} · {formatDateTime(task.due_date)}</p>
                    {task.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{task.description}</p> : null}
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <div className="flex gap-2">
                      <Badge value={task.status}>{task.status}</Badge>
                      <Badge value={task.priority}>{task.priority}</Badge>
                    </div>
                    <form action={updateTaskStatus} className="flex gap-2">
                      <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
                      <input type="hidden" name="id" value={task.id} />
                      <select name="status" defaultValue={task.status ?? "pending"} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">
                        <option value="pending">Pending</option>
                        <option value="in_progress">In progress</option>
                        <option value="in_review">In review</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      <button className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white">تحديث</button>
                    </form>
                    <div className="flex gap-2">
                      <Link href={`/tasks/${task.id}/edit`} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">تعديل</Link>
                      <form action={deleteTask}>
                        <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
                        <input type="hidden" name="id" value={task.id} />
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
