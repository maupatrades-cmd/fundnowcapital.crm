import { useRef } from "react";
import { Paperclip, Trash2, Upload } from "lucide-react";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import type { DocumentUpload } from "@/lib/newLeadTypes";
import { Select } from "@/components/forms/Field";

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function Step6Documents({
  value,
  onChange,
}: {
  value: DocumentUpload[];
  onChange: (v: DocumentUpload[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPick = (files: FileList | null) => {
    if (!files) return;
    const next: DocumentUpload[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > 10 * 1024 * 1024) continue;
      next.push({ file: f, category: "other" });
    }
    onChange([...value, ...next]);
  };

  // count by category for checklist
  const uploadedCats = new Set(value.map((d) => d.category));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-xl text-fnc-text">Document checklist</h3>
        <p className="mt-1 text-sm text-fnc-text-muted">
          PDF, JPG, PNG · max 10 MB per file. Files upload to the private
          <code className="mx-1 rounded bg-white/5 px-1.5 py-0.5">client-documents</code>
          bucket on submit.
        </p>
      </div>

      <div
        className="rounded-xl border border-dashed border-fnc-teal/40 bg-fnc-dark p-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onPick(e.dataTransfer.files);
        }}
      >
        <Upload className="mx-auto h-7 w-7 text-fnc-teal" />
        <p className="mt-3 text-sm text-fnc-text">
          Drop files here, or{" "}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-fnc-teal hover:text-fnc-teal-bright"
          >
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-fnc-text-muted">Multi-select supported</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png"
          hidden
          onChange={(e) => {
            onPick(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {value.length > 0 && (
        <div className="rounded-xl border border-fnc-border bg-fnc-dark-card divide-y divide-fnc-border">
          {value.map((d, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Paperclip className="h-4 w-4 text-fnc-teal-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fnc-text">{d.file.name}</p>
                <p className="text-[11px] text-fnc-text-muted">
                  {humanSize(d.file.size)} · {d.file.type || "unknown"}
                </p>
              </div>
              <Select
                value={d.category}
                onChange={(e) => {
                  const next = [...value];
                  next[i] = { ...d, category: e.target.value };
                  onChange(next);
                }}
                className="h-9 max-w-[220px]"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
                <option value="other">Other</option>
              </Select>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="rounded-md p-1.5 text-fnc-text-muted hover:bg-white/5 hover:text-red-300"
                aria-label="Remove file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-5">
        <p className="fnc-eyebrow">Recommended categories</p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {DOCUMENT_CATEGORIES.map((c) => {
            const ok = uploadedCats.has(c.value);
            return (
              <li key={c.value} className="flex items-center gap-2">
                <span
                  className={
                    "inline-block h-3.5 w-3.5 rounded-sm border " +
                    (ok
                      ? "border-fnc-teal bg-fnc-teal/20 text-fnc-teal"
                      : "border-fnc-border")
                  }
                >
                  {ok && <span className="block text-center text-[10px] leading-3 text-fnc-teal">✓</span>}
                </span>
                <span className={ok ? "text-fnc-text" : "text-fnc-text-muted"}>{c.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
