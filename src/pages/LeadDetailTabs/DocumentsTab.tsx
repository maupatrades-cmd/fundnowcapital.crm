import { useEffect, useRef, useState } from "react";
import { Download, FileText, Paperclip, Trash2, Upload } from "lucide-react";
import { Button, Select } from "@/components/forms/Field";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

type DocRow = {
  id: string;
  category: string;
  document_name: string;
  storage_path: string;
  file_size_kb: number | null;
  mime_type: string | null;
  review_status: string;
  uploaded_at: string;
};

const BUCKET = "client-documents";

function categoryLabel(value: string): string {
  return DOCUMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function formatSize(kb: number | null): string {
  if (!kb) return "—";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function DocumentsTab({
  leadId,
  clientId,
  businessId,
}: {
  leadId: string;
  clientId: string | null;
  businessId: string | null;
}) {
  const [docs, setDocs] = useState<DocRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>(DOCUMENT_CATEGORIES[0].value);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data, error } = await supabase
      .from("documents")
      .select("id, category, document_name, storage_path, file_size_kb, mime_type, review_status, uploaded_at")
      .eq("lead_id", leadId)
      .order("uploaded_at", { ascending: false });
    if (error) setError(error.message);
    else setDocs((data as DocRow[]) ?? []);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  async function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is over 10 MB.`);
          continue;
        }
        const path = `${clientId ?? "unknown"}/${leadId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type });
        if (upErr) {
          setError(upErr.message);
          continue;
        }
        const { error: insErr } = await supabase.from("documents").insert({
          lead_id: leadId,
          client_id: clientId,
          business_id: businessId,
          category: uploadCategory,
          document_name: file.name,
          storage_path: path,
          file_size_kb: Math.round(file.size / 1024),
          mime_type: file.type,
        });
        if (insErr) setError(insErr.message);
      }
      await load();
    } finally {
      setUploading(false);
    }
  }

  async function onDownload(doc: DocRow) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.storage_path, 60);
    if (error || !data) {
      setError(error?.message ?? "Could not generate download link.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function onDelete(doc: DocRow) {
    if (!confirm(`Delete ${doc.document_name}? This cannot be undone.`)) return;
    setError(null);
    const { error: stErr } = await supabase.storage.from(BUCKET).remove([doc.storage_path]);
    if (stErr) {
      setError(stErr.message);
      return;
    }
    const { error: rowErr } = await supabase.from("documents").delete().eq("id", doc.id);
    if (rowErr) {
      setError(rowErr.message);
      return;
    }
    await load();
  }

  async function onReviewChange(doc: DocRow, status: string) {
    setError(null);
    const { error: e } = await supabase
      .from("documents")
      .update({ review_status: status })
      .eq("id", doc.id);
    if (e) setError(e.message);
    else await load();
  }

  // Group documents by category for folder view
  const byCategory = new Map<string, DocRow[]>();
  for (const d of docs ?? []) {
    const list = byCategory.get(d.category) ?? [];
    list.push(d);
    byCategory.set(d.category, list);
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <p className="fnc-eyebrow">Category for next upload</p>
            <div className="mt-2">
              <Select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
                <option value="other">Other</option>
              </Select>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-1.5 inline-block h-4 w-4" />
            {uploading ? "Uploading…" : "Upload files"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="application/pdf,image/jpeg,image/png"
            hidden
            onChange={(e) => {
              void onUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <p className="mt-3 text-xs text-fnc-text-muted">
          PDF, JPG, PNG · max 10 MB per file. Stored in the private{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5">{BUCKET}</code> bucket.
        </p>
      </div>

      {docs === null ? (
        <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-10">
          <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-10 text-center">
          <FileText className="mx-auto h-7 w-7 text-fnc-teal-muted" />
          <p className="mt-3 text-sm text-fnc-text">No documents uploaded for this lead yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byCategory.entries()).map(([cat, list]) => (
            <div key={cat} className="rounded-xl border border-fnc-border bg-fnc-dark-card">
              <div className="border-b border-fnc-border p-4">
                <p className="fnc-eyebrow">{categoryLabel(cat)}</p>
                <p className="mt-1 text-xs text-fnc-text-muted">
                  {list.length} file{list.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="divide-y divide-fnc-border">
                {list.map((d) => (
                  <div key={d.id} className="flex flex-wrap items-center gap-3 p-3">
                    <Paperclip className="h-4 w-4 text-fnc-teal-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-fnc-text">{d.document_name}</p>
                      <p className="text-[11px] text-fnc-text-muted">
                        {formatSize(d.file_size_kb)} · {d.mime_type ?? "—"} ·{" "}
                        {new Date(d.uploaded_at).toLocaleString("en-ZA")}
                      </p>
                    </div>
                    <Select
                      value={d.review_status}
                      onChange={(e) => void onReviewChange(d, e.target.value)}
                      className="h-9 max-w-[180px]"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="needs_replacement">Needs replacement</option>
                    </Select>
                    <button
                      type="button"
                      onClick={() => void onDownload(d)}
                      className="rounded-md p-1.5 text-fnc-text-muted hover:bg-white/5 hover:text-fnc-teal"
                      aria-label="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(d)}
                      className="rounded-md p-1.5 text-fnc-text-muted hover:bg-white/5 hover:text-red-300"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
