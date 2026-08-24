import Link from "next/link";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getClients, getOfficeContext } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const context = await getOfficeContext();
  const clients = await getClients(context.office?.id, params.q);

  return (
    <>
      <PageHeader
        title="العملاء"
        description="إدارة عملاء المكتب: أفراد وشركات، بيانات ضريبية وتواصل."
        actions={<ButtonLink href="/clients/new">عميل جديد</ButtonLink>}
      />

      <form className="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <input className="input" name="q" defaultValue={params.q ?? ""} placeholder="بحث بالاسم، البريد، الهاتف، الرقم الضريبي..." />
        <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">بحث</button>
        {params.q ? <Link href="/clients" className="rounded-2xl border border-slate-200 px-5 py-3 text-center text-sm font-bold">مسح</Link> : null}
      </form>

      {clients.length === 0 ? (
        <EmptyState title="لا يوجد عملاء" description="جرّب تغيير كلمة البحث أو أضف أول عميل." action={<ButtonLink href="/clients/new">إضافة عميل</ButtonLink>} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">العميل</th>
                  <th className="px-5 py-4 font-bold">النوع</th>
                  <th className="px-5 py-4 font-bold">التواصل</th>
                  <th className="px-5 py-4 font-bold">الرقم الضريبي</th>
                  <th className="px-5 py-4 font-bold">الحالة</th>
                  <th className="px-5 py-4 font-bold">تاريخ الإضافة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <Link href={`/clients/${client.id}`} className="font-black text-slate-950 hover:underline">
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{client.client_type === "company" ? "شركة" : "فرد"}</td>
                    <td className="px-5 py-4 text-slate-600">{client.email ?? client.phone ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-600">{client.tax_number ?? "—"}</td>
                    <td className="px-5 py-4"><Badge value={client.status}>{client.status}</Badge></td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(client.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
