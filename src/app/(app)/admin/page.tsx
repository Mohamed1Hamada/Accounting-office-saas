import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { canManageSystem, getActivityLogs, getDashboardData, getOfficeContext, getStaff } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

const actionLabels: Record<string, string> = {
  create_office: "إنشاء المكتب",
  create_client: "إضافة عميل",
  update_client: "تعديل عميل",
  delete_client: "حذف عميل",
  create_service: "إضافة خدمة",
  update_service: "تعديل خدمة",
  delete_service: "حذف خدمة",
  assign_service_to_client: "ربط خدمة بعميل",
  update_client_service_status: "تحديث حالة خدمة عميل",
  create_task: "إضافة مهمة",
  update_task: "تعديل مهمة",
  update_task_status: "تحديث حالة مهمة",
  delete_task: "حذف مهمة",
  create_deadline: "إضافة موعد",
  update_deadline: "تعديل موعد",
  update_deadline_status: "تحديث حالة موعد",
  delete_deadline: "حذف موعد",
  create_invitation: "إنشاء دعوة",
  revoke_invitation: "إلغاء دعوة",
  upload_document: "رفع مستند",
};

export default async function AdminPage() {
  const context = await getOfficeContext();
  if (!context.office || (!context.demoMode && !canManageSystem(context.office.role))) notFound();

  const [dashboard, staff, logs] = await Promise.all([
    getDashboardData(context.office.id),
    getStaff(context.office.id),
    getActivityLogs(context.office.id, 80),
  ]);

  return (
    <>
      <PageHeader
        title="إدارة النظام"
        description="لوحة بسيطة لمالك المكتب: إحصائيات، أعضاء الفريق، وسجل العمليات المهمة."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="العملاء" value={dashboard.stats.clients} hint="إجمالي العملاء" />
        <StatCard title="المهام المفتوحة" value={dashboard.stats.activeTasks} hint="مهام غير مكتملة" />
        <StatCard title="المواعيد القادمة" value={dashboard.stats.upcomingDeadlines} hint="Deadlines نشطة" />
        <StatCard title="أعضاء الفريق" value={staff.length} hint="المستخدمون داخل المكتب" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-black">أعضاء الفريق</h2>
          <div className="space-y-3">
            {staff.map((member) => (
              <div key={member.id} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-black">{member.profiles?.full_name ?? "بدون اسم"}</p>
                <div className="mt-2 flex gap-2">
                  <Badge value={member.role}>{member.role}</Badge>
                  <Badge value={member.status}>{member.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-black">Activity Logs</h2>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{actionLabels[log.action] ?? log.action}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {log.user_name ?? "مستخدم"} · {log.entity_type ?? "—"} · {formatDateTime(log.created_at)}
                    </p>
                  </div>
                  <Badge value="active">{log.action}</Badge>
                </div>
                {log.metadata ? (
                  <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
