import { DocumentUpload } from "@/components/document-upload";
import { DocumentsList } from "@/components/documents-list";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getClients, getDocuments, getOfficeContext } from "@/lib/data";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ q?: string; client_id?: string }> }) {
  const params = await searchParams;
  const context = await getOfficeContext();
  const [clients, documents] = await Promise.all([
    getClients(context.office?.id),
    getDocuments(context.office?.id, { search: params.q, clientId: params.client_id }),
  ]);

  return (
    <>
      <PageHeader title="المستندات" description="رفع وبحث وتصفية مستندات العملاء على Supabase Storage." />

      <form className="mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_260px_auto]">
        <input className="input" name="q" defaultValue={params.q ?? ""} placeholder="بحث باسم الملف أو النوع..." />
        <select className="input" name="client_id" defaultValue={params.client_id ?? ""}>
          <option value="">كل العملاء</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
        <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">تطبيق البحث</button>
      </form>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <DocumentUpload officeId={context.office?.id ?? ""} clients={clients} />
        {documents.length === 0 ? (
          <EmptyState title="لا توجد مستندات" description="ارفع أول مستند أو غيّر عوامل البحث والتصفية." />
        ) : (
          <DocumentsList documents={documents} />
        )}
      </div>
    </>
  );
}
