import Link from "next/link";
import { Badge } from "@/components/badge";
import { SubmitButton } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { createInvitation, revokeInvitation } from "@/lib/actions/app";
import { getInvitations, getOfficeContext, getStaff } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function StaffPage() {
  const context = await getOfficeContext();
  const [staff, invitations] = await Promise.all([
    getStaff(context.office?.id),
    getInvitations(context.office?.id),
  ]);

  return (
    <>
      <PageHeader title="الفريق والصلاحيات" description="إدارة أعضاء المكتب ودعوات الانضمام. Owner/Admin فقط يقدروا يدعوا أعضاء جدد حسب RLS." />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="space-y-6">
          <form action={createInvitation} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
            <h2 className="mb-5 text-lg font-black">دعوة عضو جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input className="input" name="email" type="email" required placeholder="accountant@example.com" />
              </div>
              <div>
                <label className="label">الدور</label>
                <select className="input" name="role" defaultValue="accountant">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="accountant">Accountant</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <SubmitButton>إنشاء الدعوة</SubmitButton>
              <p className="text-xs leading-5 text-slate-500">
                بعد الإنشاء ابعت للعضو رابط الدعوة الظاهر تحت. في النسخة التجارية اربطه بخدمة Email زي Resend.
              </p>
            </div>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black">الدعوات</h2>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{invitation.email}</p>
                      <p className="mt-1 text-xs text-slate-500">{invitation.role} · {formatDateTime(invitation.created_at)}</p>
                      <Link href={`/invite/${invitation.token}`} className="mt-2 block break-all text-xs font-bold text-blue-700 hover:underline">
                        /invite/{invitation.token}
                      </Link>
                    </div>
                    <Badge value={invitation.status}>{invitation.status}</Badge>
                  </div>
                  {invitation.status === "pending" && context.office?.id !== "demo-office" ? (
                    <form action={revokeInvitation} className="mt-3">
                      <input type="hidden" name="office_id" value={context.office?.id ?? ""} />
                      <input type="hidden" name="id" value={invitation.id} />
                      <button className="text-xs font-bold text-rose-600 hover:underline">إلغاء الدعوة</button>
                    </form>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-bold">الاسم</th>
                <th className="px-5 py-4 font-bold">الدور</th>
                <th className="px-5 py-4 font-bold">الحالة</th>
                <th className="px-5 py-4 font-bold">الهاتف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => (
                <tr key={member.id}>
                  <td className="px-5 py-4 font-black">{member.profiles?.full_name ?? "بدون اسم"}</td>
                  <td className="px-5 py-4"><Badge value={member.role}>{member.role}</Badge></td>
                  <td className="px-5 py-4"><Badge value={member.status}>{member.status}</Badge></td>
                  <td className="px-5 py-4 text-slate-600">{member.profiles?.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
