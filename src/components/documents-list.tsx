"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DocumentItem } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

function formatBytes(bytes?: number | null) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function DocumentsList({ documents }: { documents: DocumentItem[] }) {
  const [message, setMessage] = useState<string | null>(null);

  async function openDocument(path: string) {
    setMessage(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فشل فتح المستند.");
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-black">المستندات المرفوعة</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{documents.length}</span>
      </div>

      {message ? <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">{message}</div> : null}

      <div className="space-y-3">
        {documents.map((document) => (
          <div key={document.id} className="rounded-2xl border border-slate-100 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-slate-950">{document.file_name}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {document.client_name ?? "بدون عميل"} · {formatBytes(document.file_size)} · {formatDateTime(document.created_at)}
                </p>
                <p className="mt-1 break-all text-xs text-slate-400">{document.file_path}</p>
              </div>
              <button
                onClick={() => openDocument(document.file_path)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                فتح / تحميل
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
