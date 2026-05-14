import { Plus, Trash2 } from "lucide-react";
import { Button, Checkbox, Field, Select, TextInput } from "@/components/forms/Field";
import { DIRECTOR_ROLES } from "@/lib/constants";
import { type DirectorEntry, emptyDirector } from "@/lib/newLeadTypes";

export function Step4Directors({
  value,
  onChange,
}: {
  value: DirectorEntry[];
  onChange: (v: DirectorEntry[]) => void;
}) {
  const updateDirector = (i: number, patch: Partial<DirectorEntry>) => {
    onChange(value.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  };
  const totalPct = value.reduce((sum, d) => sum + (Number(d.shareholding_pct) || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-xl text-fnc-text">Directors &amp; shareholders</h3>
        <p className="mt-1 text-sm text-fnc-text-muted">
          Add every director / member. ID numbers encrypted at rest.
        </p>
      </div>

      <div className="space-y-3">
        {value.map((d, i) => (
          <div
            key={i}
            className="rounded-xl border border-fnc-border bg-fnc-dark p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="fnc-eyebrow">Director #{i + 1}</p>
              {value.length > 1 && (
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fnc-text-muted hover:bg-white/5 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full Name" required>
                <TextInput
                  value={d.full_name}
                  onChange={(e) => updateDirector(i, { full_name: e.target.value })}
                  required
                />
              </Field>
              <Field label="ID Number" required>
                <TextInput
                  value={d.id_number}
                  onChange={(e) => updateDirector(i, { id_number: e.target.value })}
                  maxLength={13}
                  inputMode="numeric"
                  required
                />
              </Field>
              <Field label="Role" required>
                <Select
                  value={d.role}
                  onChange={(e) => updateDirector(i, { role: e.target.value })}
                  required
                >
                  {DIRECTOR_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Shareholding %" required>
                <TextInput
                  type="number"
                  min={0}
                  max={100}
                  inputMode="decimal"
                  value={d.shareholding_pct}
                  onChange={(e) => updateDirector(i, { shareholding_pct: e.target.value })}
                  required
                />
              </Field>
              <Field label="Email">
                <TextInput
                  type="email"
                  value={d.email}
                  onChange={(e) => updateDirector(i, { email: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <TextInput
                  type="tel"
                  value={d.phone}
                  onChange={(e) => updateDirector(i, { phone: e.target.value })}
                />
              </Field>
              <div className="md:col-span-2">
                <Checkbox
                  label="Authorised signatory"
                  checked={d.is_signatory}
                  onChange={(v) => updateDirector(i, { is_signatory: v })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className={"text-sm " + (Math.abs(totalPct - 100) < 0.01 ? "text-fnc-teal" : "text-fnc-text-muted")}>
          Total shareholding: {totalPct.toFixed(2)}%{" "}
          {Math.abs(totalPct - 100) >= 0.01 && totalPct > 0 && (
            <span className="text-yellow-400">(should equal 100%)</span>
          )}
        </p>
        <Button
          variant="secondary"
          onClick={() => onChange([...value, emptyDirector()])}
        >
          <Plus className="mr-1.5 inline-block h-4 w-4" /> Add Director
        </Button>
      </div>
    </div>
  );
}
