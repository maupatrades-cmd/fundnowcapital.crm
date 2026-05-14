import { Checkbox, Field, Select, TextInput } from "@/components/forms/Field";
import type { FinancialStep } from "@/lib/newLeadTypes";
import { ACCOUNT_TYPES, BANKS } from "@/lib/constants";
import { useEffect } from "react";

export function Step3Financial({
  value,
  onChange,
}: {
  value: FinancialStep;
  onChange: (v: FinancialStep) => void;
}) {
  const set = <K extends keyof FinancialStep>(k: K, v: FinancialStep[K]) =>
    onChange({ ...value, [k]: v });

  // Auto-derive annual turnover when monthly is entered (and annual is empty/unchanged)
  useEffect(() => {
    const monthly = Number(value.monthly_turnover);
    if (monthly > 0 && !value.annual_turnover) {
      onChange({ ...value, annual_turnover: String(monthly * 12) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.monthly_turnover]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-xl text-fnc-text">Financial profile</h3>
        <p className="mt-1 text-sm text-fnc-text-muted">
          Turnover and banking. Bank account number is encrypted at rest.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Monthly Turnover (R)" required>
          <TextInput
            type="number"
            min={0}
            inputMode="decimal"
            value={value.monthly_turnover}
            onChange={(e) => set("monthly_turnover", e.target.value)}
            required
          />
        </Field>
        <Field label="Annual Turnover (R)" required hint="Auto-calculated, override if needed.">
          <TextInput
            type="number"
            min={0}
            inputMode="decimal"
            value={value.annual_turnover}
            onChange={(e) => set("annual_turnover", e.target.value)}
            required
          />
        </Field>
        <Field label="Monthly Net Profit (R)">
          <TextInput
            type="number"
            inputMode="decimal"
            value={value.monthly_net_profit}
            onChange={(e) => set("monthly_net_profit", e.target.value)}
          />
        </Field>
        <Field label="Bank Name" required>
          <Select value={value.bank_name} onChange={(e) => set("bank_name", e.target.value)} required>
            <option value="" disabled>Select bank…</option>
            {BANKS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </Select>
        </Field>
        <Field label="Account Type">
          <Select value={value.account_type} onChange={(e) => set("account_type", e.target.value)}>
            <option value="">—</option>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Account Holder Name">
          <TextInput value={value.account_holder_name} onChange={(e) => set("account_holder_name", e.target.value)} />
        </Field>
        <Field label="Bank Account Number" required hint="Encrypted at rest.">
          <TextInput
            value={value.bank_account_number}
            onChange={(e) => set("bank_account_number", e.target.value)}
            required
          />
        </Field>
        <Field label="Branch Code">
          <TextInput value={value.bank_branch_code} onChange={(e) => set("bank_branch_code", e.target.value)} />
        </Field>
      </div>

      <div className="rounded-lg border border-fnc-border bg-fnc-dark p-4">
        <Checkbox
          label="This client has existing loans / finance"
          checked={value.has_existing_finance}
          onChange={(v) => set("has_existing_finance", v)}
        />

        {value.has_existing_finance && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Lender">
              <TextInput value={value.existing_finance_lender} onChange={(e) => set("existing_finance_lender", e.target.value)} />
            </Field>
            <Field label="Outstanding Balance (R)">
              <TextInput
                type="number"
                inputMode="decimal"
                value={value.existing_finance_balance}
                onChange={(e) => set("existing_finance_balance", e.target.value)}
              />
            </Field>
            <Field label="Monthly Repayment (R)">
              <TextInput
                type="number"
                inputMode="decimal"
                value={value.existing_finance_monthly}
                onChange={(e) => set("existing_finance_monthly", e.target.value)}
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
