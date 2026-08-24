"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ClientItem } from "@/lib/types";

function sanitizeFileName(name: string) {
  return name
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/-+/g, "-")
    .slice(0, 140);
}

export function DocumentUpload({ officeId, clients }: { officeId: string; clients: ClientItem[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const disabledReason = useMemo(() => {
    if (!officeId || officeId === "demo-office") return "الرفع الحقيقي يحتاج توصيل Supabase env vars.";
    if (clients.length === 0) return "أضف عميل أولًا قبل رفع المستندات.";
    return null;
  }, [clients.length, officeId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!file || !clientId) {
      setMessage("اختار العميل والملف أولًا.");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      const safeName = sanitizeFileName(file.name);
      const filePath = `${officeId}/${clientId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) throw uploadError;

      const { data: documentRow, error: insertError } = await supabase
        .from("documents")
        .insert({
          office_id: officeId,
          client_id: clientId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type || null,
          file_size: file.size,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("activity_logs").insert({
        office_id: officeId,
        user_id: userData.user?.id ?? null,
        action: "upload_document",
        entity_type: "document",
        entity_id: documentRow?.id ?? null,
        metadata: {
          client_id: clientId,
          file_name: file.name,
          file_size: file.size,
        },
      });

      setFile(null);
      setMessage("تم رفع المستند بنجاح.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فشل رفع المستند.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-black">رفع مستند</h2>

      {disabledReason ? (
        <div className="mb-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800 ring-1 ring-amber-200">
          {disabledReason}
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <label className="label">العميل</label>
          <select className="input" value={clientId} onChange={(event) => setClientId(event.target.value)} disabled={Boolean(disabledReason)}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">الملف</label>
          <input className="input" type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} disabled={Boolean(disabledReason)} />
          <p className="mt-2 text-xs text-slate-500">الحد في SQL الحالي للـ bucket هو 50MB.</p>
        </div>
        <button
          disabled={Boolean(disabledReason) || isUploading}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isUploading ? "جاري الرفع..." : "رفع المستند"}
        </button>
      </div>

      {message ? <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{message}</p> : null}
    </form>
  );
}
