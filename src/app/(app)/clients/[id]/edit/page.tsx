import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { deleteClientRecord, updateClientRecord } from "@/lib/actions/app";
import { getClient, getOfficeContext } from "@/lib/data";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getOfficeContext();
  if (!context.office) notFound();

  const client = await getClient(context.office.id, id);
  if (!client) notFound();

  return (
    <>
      <PageHeader title={`تعديل ${client.name}`} description="تعديل بيانات العميل الأساسية وحالته." />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.45fr]">
        <form action={updateClientRecord} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="id" value={client.id} />
          <input type="hidden" name="office_id" value={context.office.id} />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">اسم العميل</label>
              <input className="input" name="name" required defaultValue={client.name} />
            </div>
            <div>
              <label className="label">نوع العميل</label>
              <select className="input" name="client_type" defaultValue={client.client_type ?? "company"}>
                <option value="company">شركة</option>
                <option value="individual">فرد</option>
              </select>
            </div>
            <div>
              <label className="label">الحالة</label>
              <select className="input" name="status" defaultValue={client.status ?? "active"}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="label">الهاتف</label>
              <input className="input" name="phone" defaultValue={client.phone ?? ""} />
            </div>
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input className="input" name="email" type="email" defaultValue={client.email ?? ""} />
            </div>
            <div>
              <label className="label">الرقم الضريبي</label>
              <input className="input" name="tax_number" defaultValue={client.tax_number ?? ""} />
            </div>
            <div>
              <label className="label">رقم السجل التجاري</label>
              <input className="input" name="registration_number" defaultValue={client.registration_number ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">العنوان</label>
              <input className="input" name="address" defaultValue={client.address ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">ملاحظات</label>
              <textarea className="input min-h-28" name="notes" defaultValue={client.notes ?? ""} />
            </div>
          </div>
          <div className="mt-6">
            <SubmitButton>حفظ التعديلات</SubmitButton>
          </div>
        </form>

        <section className="h-fit rounded-3xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="font-black text-rose-950">منطقة خطرة</h2>
          <p className="mt-2 text-sm leading-6 text-rose-700">
            حذف العميل قد يفشل لو عليه بيانات مرتبطة تمنع الحذف. في الإنتاج الأفضل تعمل Archive بدل الحذف.
          </p>
          <form action={deleteClientRecord} className="mt-5">
            <input type="hidden" name="id" value={client.id} />
            <input type="hidden" name="office_id" value={context.office.id} />
            <button className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-700">
              حذف العميل
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
