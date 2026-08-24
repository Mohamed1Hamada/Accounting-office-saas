import { SubmitButton } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { createClientRecord } from "@/lib/actions/app";
import { getOfficeContext } from "@/lib/data";

export default async function NewClientPage() {
  const context = await getOfficeContext();

  return (
    <>
      <PageHeader title="إضافة عميل جديد" description="أدخل البيانات الأساسية، ويمكن إضافة الملفات والخدمات بعد إنشاء العميل." />

      <form action={createClientRecord} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">اسم العميل</label>
            <input className="input" name="name" required placeholder="اسم الشركة أو الشخص" />
          </div>
          <div>
            <label className="label">نوع العميل</label>
            <select className="input" name="client_type" defaultValue="company">
              <option value="company">شركة</option>
              <option value="individual">فرد</option>
            </select>
          </div>
          <div>
            <label className="label">الهاتف</label>
            <input className="input" name="phone" />
          </div>
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input className="input" name="email" type="email" />
          </div>
          <div>
            <label className="label">الرقم الضريبي</label>
            <input className="input" name="tax_number" />
          </div>
          <div>
            <label className="label">رقم السجل التجاري</label>
            <input className="input" name="registration_number" />
          </div>
          <div>
            <label className="label">العنوان</label>
            <input className="input" name="address" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">ملاحظات</label>
            <textarea className="input min-h-28" name="notes" />
          </div>
        </div>
        <div className="mt-6">
          <SubmitButton>حفظ العميل</SubmitButton>
        </div>
      </form>
    </>
  );
}
