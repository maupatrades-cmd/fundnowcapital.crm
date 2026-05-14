import { Field, Select, TextArea, TextInput } from "@/components/forms/Field";
import type { BusinessStep } from "@/lib/newLeadTypes";
import { INDUSTRIES, SA_PROVINCES } from "@/lib/constants";

export function Step2Business({
  value,
  onChange,
}: {
  value: BusinessStep;
  onChange: (v: BusinessStep) => void;
}) {
  const set = <K extends keyof BusinessStep>(k: K, v: BusinessStep[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-xl text-fnc-text">Business details</h3>
        <p className="mt-1 text-sm text-fnc-text-muted">
          The trading entity. Goes into <code>businesses</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Registered Business Name" required>
          <TextInput value={value.registered_name} onChange={(e) => set("registered_name", e.target.value)} required />
        </Field>
        <Field label="Trading Name (if different)">
          <TextInput value={value.trading_name} onChange={(e) => set("trading_name", e.target.value)} />
        </Field>
        <Field label="CIPC Registration Number" required hint="Format: YYYY/NNNNNN/NN">
          <TextInput
            value={value.cipc_number}
            onChange={(e) => set("cipc_number", e.target.value)}
            placeholder="2024/123456/07"
            required
          />
        </Field>
        <Field label="VAT Number (if registered)">
          <TextInput value={value.vat_number} onChange={(e) => set("vat_number", e.target.value)} />
        </Field>
        <Field label="Industry" required>
          <Select value={value.industry} onChange={(e) => set("industry", e.target.value)} required>
            <option value="" disabled>Select an industry…</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </Select>
        </Field>
        <Field label="Date Business Started" required>
          <TextInput
            type="date"
            value={value.date_business_started}
            onChange={(e) => set("date_business_started", e.target.value)}
            required
          />
        </Field>
        <Field label="Number of Employees">
          <TextInput
            type="number"
            min={0}
            value={value.num_employees}
            onChange={(e) => set("num_employees", e.target.value)}
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
        <Field label="City" required>
          <TextInput value={value.city} onChange={(e) => set("city", e.target.value)} required />
        </Field>
        <Field label="Trading Address" required className="md:col-span-2">
          <TextInput value={value.trading_address} onChange={(e) => set("trading_address", e.target.value)} required />
        </Field>
        <Field label="Operating Address (if different)" className="md:col-span-2">
          <TextInput value={value.operating_address} onChange={(e) => set("operating_address", e.target.value)} />
        </Field>
        <Field label="Business Description" className="md:col-span-2">
          <TextArea value={value.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
