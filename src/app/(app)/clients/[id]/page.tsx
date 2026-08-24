import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { getClient, getClientServices, getOfficeContext } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getOfficeContext();
  if (!context.office) notFound();

  const [client, clientServices] = await Promise.all([
    getClient(context.office.id, id),
    getClientServices(context.office.id, id),
  ]);
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title={client.name}
        description="صفحة تفاصيل العميل: البيانات، الخدمات، الملفات والمستندات المرتبطة به."
        actions={
          <>
            <ButtonLink href={`/clients/${client.id}/edit`}>تعديل العميل</ButtonLink>
            <ButtonLink href="/services" variant="secondary">ربط خدمة</ButtonLink>
            <ButtonLink href="/clients" variant="secondary">رجوع للعملاء</ButtonLink>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-black">بيانات العميل</h2>
            <Badge value={client.status}>{client.status}</Badge>
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            <Info label="النوع" value={client.client_type === "company" ? "شركة" : "فرد"} />
            <Info label="تاريخ الإضافة" value={formatDate(client.created_at)} />
            <Info label="الهاتف" value={client.phone} />
            <Info label="البريد" value={client.email} />
            <Info label="الرقم الضريبي" value={client.tax_number} />
            <Info label="السجل التجاري" value={client.registration_number} />
            <Info label="العنوان" value={client.address} />
            <Info label="ملاحظات" value={client.notes} />
          </dl>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-black">خدمات العميل</h3>
              <Badge value="active">{clientServices.length}</Badge>
            </div>
            {clientServices.length === 0 ? (
              <p className="text-sm leading-6 text-slate-500">لا توجد خدمات مرتبطة بهذا العميل بعد. اضغط ربط خدمة.</p>
            ) : (
              <div className="space-y-3">
                {clientServices.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
                    <p className="font-bold text-slate-950">{item.service_name ?? "خدمة"}</p>
                    <p className="mt-1 text-xs text-slate-500">الحالة: {item.status} · بداية: {formatDate(item.start_date)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-black">الخطوات التالية</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>• اربط العميل بخدمة من صفحة الخدمات.</li>
              <li>• أضف مهمة مرتبطة بالعميل من صفحة المهام.</li>
              <li>• أضف Deadline مرتبط بالعميل من صفحة المواعيد.</li>
              <li>• ارفع المستندات من صفحة المستندات.</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-bold text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-800">{value || "—"}</dd>
    </div>
  );
}
