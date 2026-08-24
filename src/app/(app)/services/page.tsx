import Link from "next/link";
import { Badge } from "@/components/badge";
import { SubmitButton } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { assignServiceToClient, createService, deleteService, updateClientServiceStatus } from "@/lib/actions/app";
import { getClients, getClientServices, getOfficeContext, getServices } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const context = await getOfficeContext();
  const [services, clients, clientServices] = await Promise.all([
    getServices(context.office?.id, params.q),
    getClients(context.office?.id),
    getClientServices(context.office?.id),
  ]);

  return (
    <>
      <PageHeader title="الخدمات" description="كتالوج خدمات المكتب وربط كل خدمة بالعميل المناسب." />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="space-y-6">
          <form action={createService} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
            <h2 className="mb-5 text-lg font-black">إضافة خدمة</h2>
            <div className="space-y-4">
              <div>
                <label className="label">اسم الخدمة</label>
                <input className="input" name="name" required placeholder="مثال: إقرار القيمة المضافة" />
              </div>
              <div>
                <label className="label">الوصف</label>
                <textarea className="input min-h-28" name="description" />
              </div>
              <SubmitButton>حفظ الخدمة</SubmitButton>
            </div>
          </form>

          <form action={assignServiceToClient} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
            <h2 className="mb-5 text-lg font-black">ربط خدمة بعميل</h2>
            <div className="space-y-4">
              <div>
                <label className="label">العميل</label>
                <select className="input" name="client_id" required>
                  <option value="">اختر العميل</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">الخدمة</label>
                <select className="input" name="service_id" required>
                  <option value="">اختر الخدمة</option>
                  {services.filter((service) => service.is_active !== false).map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">تاريخ البداية</label>
                <input className="input" name="start_date" type="date" />
              </div>
              <input type="hidden" name="status" value="active" />
              <SubmitButton>ربط الخدمة بالعميل</SubmitButton>
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-black">كتالوج الخدمات</h2>
              <form className="flex gap-2">
                <input className="input h-10" name="q" defaultValue={params.q ?? ""} placeholder="بحث..." />
                <button className="rounded-xl bg-slate-950 px-4 text-sm font-bold text-white">بحث</button>
              </form>
            </div>
            {services.length === 0 ? (
              <EmptyState title="لا توجد خدمات" description="أضف الخدمات الأساسية للمكتب: ضريبة دخل، قيمة مضافة، تأسيس، مراجعة..." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <div key={service.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-slate-950">{service.name}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{service.description ?? "بدون وصف"}</p>
                      </div>
                      <Badge value={service.is_active ? "active" : "inactive"}>{service.is_active ? "active" : "inactive"}</Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/services/${service.id}/edit`} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">تعديل</Link>
                      <form action={deleteService}>
                        <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
                        <input type="hidden" name="id" value={service.id} />
                        <button className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">حذف</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black">الخدمات المرتبطة بالعملاء</h2>
            {clientServices.length === 0 ? (
              <EmptyState title="لا توجد خدمات مرتبطة" description="اختر عميل وخدمة من الفورم واربطهم ببعض." />
            ) : (
              <div className="space-y-3">
                {clientServices.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-black text-slate-950">{item.service_name ?? "خدمة"}</h3>
                        <p className="mt-1 text-sm text-slate-500">{item.client_name ?? "عميل"} · بداية: {formatDate(item.start_date)}</p>
                      </div>
                      <form action={updateClientServiceStatus} className="flex gap-2">
                        <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
                        <input type="hidden" name="id" value={item.id} />
                        <select name="status" defaultValue={item.status ?? "active"} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white">تحديث</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
