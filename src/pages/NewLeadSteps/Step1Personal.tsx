import { Field, Select, TextInput } from "@/components/forms/Field";
import type { ClientStep } from "@/lib/newLeadTypes";
import { MARITAL_STATUSES, SA_PROVINCES } from "@/lib/constants";

export function Step1Personal({
  value,
  onChange,
}: {
  value: ClientStep;
  onChange: (v: ClientStep) => void;
}) {
  const set = <K extends keyof ClientStep>(k: K, v: ClientStep[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-xl text-fnc-text">Personal details</h3>
        <p className="mt-1 text-sm text-fnc-text-muted">
          Captures the primary contact. Goes into <code>profiles</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Full Name" required>
          <TextInput value={value.full_name} onChange={(e) => set("full_name", e.target.value)} required />
        </Field>
        <Field label="ID Number" required hint="Encrypted at rest (pgcrypto + Vault key).">
          <TextInput
            value={value.id_number}
            onChange={(e) => set("id_number", e.target.value)}
            maxLength={13}
            inputMode="numeric"
            required
          />
        </Field>
        <Field label="Mobile Number" required>
          <TextInput
            type="tel"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="082 123 4567"
            required
          />
        </Field>
        <Field label="Email" required>
          <TextInput
            type="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="name@example.com"
            required
          />
        </Field>
        <Field label="Province" required>
          <Select value={value.province} onChange={(e) => set("province", e.target.value)} required>
            <option value="" disabled>Select a province…</option>
            {SA_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Field label="Marital Status">
          <Select
            value={value.marital_status}
            onChange={(e) => set("marital_status", e.target.value)}
          >
            <option value="">—</option>
            {MARITAL_STATUSES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Physical Address" className="md:col-span-2">
          <TextInput
            value={value.physical_address}
            onChange={(e) => set("physical_address", e.target.value)}
            placeholder="Street, suburb, city, postal code"
          />
        </Field>
      </div>
    </div>
  );
}
