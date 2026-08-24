import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { updateService } from "@/lib/actions/app";
import { getOfficeContext, getService } from "@/lib/data";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getOfficeContext();
  if (!context.office) notFound();
  const service = await getService(context.office.id, id);
  if (!service) notFound();

  return (
    <>
      <PageHeader title={`تعديل خدمة: ${service.name}`} description="تعديل اسم الخدمة أو وصفها أو تعطيلها بدون حذف بيانات العملاء المرتبطة." />
      <form action={updateService} className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="office_id" value={context.office.id} />
        <input type="hidden" name="id" value={service.id} />
        <div className="space-y-5">
          <div>
            <label className="label">اسم الخدمة</label>
            <input className="input" name="name" required defaultValue={service.name} />
          </div>
          <div>
            <label className="label">الوصف</label>
            <textarea className="input min-h-28" name="description" defaultValue={service.description ?? ""} />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold">
            <input type="checkbox" name="is_active" defaultChecked={service.is_active !== false} />
            الخدمة نشطة ويمكن ربطها بعملاء جدد
          </label>
          <SubmitButton>حفظ التعديل</SubmitButton>
        </div>
      </form>
    </>
  );
}
