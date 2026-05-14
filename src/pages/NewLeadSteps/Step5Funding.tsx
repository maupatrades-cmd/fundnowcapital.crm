import { Field, Select, TextArea, TextInput } from "@/components/forms/Field";
import type { FundingStep } from "@/lib/newLeadTypes";
import {
  FUNDING_TYPES,
  LEAD_SOURCES,
  PRIORITIES,
  URGENCY_OPTIONS,
} from "@/lib/constants";

export function Step5Funding({
  value,
  onChange,
}: {
  value: FundingStep;
  onChange: (v: FundingStep) => void;
}) {
  const set = <K extends keyof FundingStep>(k: K, v: FundingStep[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-xl text-fnc-text">Funding request</h3>
        <p className="mt-1 text-sm text-fnc-text-muted">
          What does the client need? Goes into <code>leads</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Funding Type" required>
          <Select value={value.funding_type} onChange={(e) => set("funding_type", e.target.value)} required>
            <option value="" disabled>Select funding type…</option>
            {FUNDING_TYPES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Amount Required (R)" required>
          <TextInput
            type="number"
            min={0}
            inputMode="decimal"
            value={value.funding_amount}
            onChange={(e) => set("funding_amount", e.target.value)}
            required
          />
        </Field>
        <Field label="How soon do they need the funds?">
          <Select value={value.urgency} onChange={(e) => set("urgency", e.target.value)}>
            <option value="">—</option>
            {URGENCY_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Preferred Repayment Term (months)">
          <TextInput
            type="number"
            min={1}
            max={120}
            value={value.preferred_term_months}
            onChange={(e) => set("preferred_term_months", e.target.value)}
          />
        </Field>
        <Field label="Lead Source" required>
          <Select value={value.source} onChange={(e) => set("source", e.target.value)} required>
            {LEAD_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={value.priority} onChange={(e) => set("priority", e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Purpose of Funding" required className="md:col-span-2">
          <TextArea
            value={value.funding_purpose}
            onChange={(e) => set("funding_purpose", e.target.value)}
            placeholder="What will this money be used for?"
            required
          />
        </Field>
        <Field label="Notes" className="md:col-span-2">
          <TextArea value={value.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
